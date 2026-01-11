#!/usr/bin/env python3
"""
PDF Splitter Script for Edexcel GCSE Computer Science Resources

This script splits large PDF files into smaller parts to improve loading times
and reduce bandwidth usage for the web application.

Usage:
    python split_pdf.py [--max-size MB] [--pages-per-split N] [--dry-run]

Options:
    --max-size: Maximum file size in MB before splitting (default: 5)
    --pages-per-split: Number of pages per split file (default: 20)
    --dry-run: Show what would be done without making changes
"""

import os
import sys
import argparse
from pathlib import Path
from PyPDF2 import PdfReader, PdfWriter


def get_file_size_mb(filepath):
    """Get file size in megabytes."""
    return os.path.getsize(filepath) / (1024 * 1024)


def split_pdf(input_path, output_dir, pages_per_split=20, dry_run=False):
    """
    Split a PDF file into multiple smaller files.

    Args:
        input_path: Path to the input PDF file
        output_dir: Directory to save split files
        pages_per_split: Number of pages per output file
        dry_run: If True, only print what would be done

    Returns:
        List of created file paths
    """
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    # Read the PDF
    reader = PdfReader(str(input_path))
    total_pages = len(reader.pages)

    if total_pages <= pages_per_split:
        print(f"  - PDF has only {total_pages} pages, no split needed")
        return []

    # Calculate number of parts
    num_parts = (total_pages + pages_per_split - 1) // pages_per_split

    print(f"  - Total pages: {total_pages}")
    print(f"  - Will create {num_parts} parts ({pages_per_split} pages each)")

    if dry_run:
        return []

    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)

    created_files = []
    base_name = input_path.stem

    for part_num in range(num_parts):
        start_page = part_num * pages_per_split
        end_page = min(start_page + pages_per_split, total_pages)

        writer = PdfWriter()
        for page_num in range(start_page, end_page):
            writer.add_page(reader.pages[page_num])

        # Create output filename
        output_filename = f"{base_name}_part{part_num + 1}.pdf"
        output_path = output_dir / output_filename

        with open(output_path, 'wb') as output_file:
            writer.write(output_file)

        size_mb = get_file_size_mb(output_path)
        print(f"  - Created: {output_filename} (pages {start_page + 1}-{end_page}, {size_mb:.2f} MB)")
        created_files.append(str(output_path))

    return created_files


def find_large_pdfs(directory, max_size_mb=5):
    """
    Find PDF files larger than the specified size.

    Args:
        directory: Directory to search
        max_size_mb: Maximum size threshold in MB

    Returns:
        List of (filepath, size_mb) tuples for files exceeding the threshold
    """
    large_pdfs = []
    directory = Path(directory)

    for pdf_path in directory.rglob("*.pdf"):
        # Skip files that are already split parts
        if "_part" in pdf_path.stem:
            continue

        size_mb = get_file_size_mb(pdf_path)
        if size_mb > max_size_mb:
            large_pdfs.append((str(pdf_path), size_mb))

    return large_pdfs


def create_index_file(output_dir, original_name, parts):
    """
    Create a JSON index file listing all parts of a split PDF.

    Args:
        output_dir: Directory where parts are stored
        original_name: Original PDF filename
        parts: List of part file paths
    """
    import json

    output_dir = Path(output_dir)
    index_data = {
        "original_file": original_name,
        "total_parts": len(parts),
        "parts": [Path(p).name for p in parts]
    }

    index_path = output_dir / f"{Path(original_name).stem}_index.json"
    with open(index_path, 'w') as f:
        json.dump(index_data, f, indent=2)

    print(f"  - Created index: {index_path.name}")
    return str(index_path)


def main():
    parser = argparse.ArgumentParser(
        description="Split large PDF files into smaller parts"
    )
    parser.add_argument(
        "--max-size",
        type=float,
        default=5,
        help="Maximum file size in MB before splitting (default: 5)"
    )
    parser.add_argument(
        "--pages-per-split",
        type=int,
        default=20,
        help="Number of pages per split file (default: 20)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes"
    )
    parser.add_argument(
        "--resources-dir",
        type=str,
        default=None,
        help="Path to resources directory (default: auto-detect)"
    )

    args = parser.parse_args()

    # Find the resources directory
    if args.resources_dir:
        resources_dir = Path(args.resources_dir)
    else:
        # Try to find it relative to the script location
        script_dir = Path(__file__).parent.parent
        resources_dir = script_dir / "resources"
        if not resources_dir.exists():
            resources_dir = Path.cwd() / "resources"

    if not resources_dir.exists():
        print(f"Error: Resources directory not found: {resources_dir}")
        sys.exit(1)

    print(f"PDF Splitter")
    print(f"============")
    print(f"Resources directory: {resources_dir}")
    print(f"Max size before split: {args.max_size} MB")
    print(f"Pages per split: {args.pages_per_split}")
    print(f"Dry run: {args.dry_run}")
    print()

    # Find large PDFs
    print("Scanning for large PDF files...")
    large_pdfs = find_large_pdfs(resources_dir, args.max_size)

    if not large_pdfs:
        print("No PDF files exceed the size threshold. Nothing to do.")
        return

    print(f"Found {len(large_pdfs)} large PDF file(s):")
    for pdf_path, size_mb in large_pdfs:
        print(f"  - {Path(pdf_path).name}: {size_mb:.2f} MB")
    print()

    # Process each large PDF
    for pdf_path, size_mb in large_pdfs:
        pdf_path = Path(pdf_path)
        print(f"Processing: {pdf_path.name}")

        # Create output directory alongside the original file
        output_dir = pdf_path.parent / f"{pdf_path.stem}_parts"

        # Split the PDF
        parts = split_pdf(
            pdf_path,
            output_dir,
            pages_per_split=args.pages_per_split,
            dry_run=args.dry_run
        )

        if parts and not args.dry_run:
            # Create index file
            create_index_file(output_dir, pdf_path.name, parts)

            # Optionally remove the original file
            print(f"  - Original file kept at: {pdf_path}")
            print(f"  - Split parts saved to: {output_dir}")

        print()

    if args.dry_run:
        print("Dry run complete. No files were modified.")
    else:
        print("PDF splitting complete!")


if __name__ == "__main__":
    main()
