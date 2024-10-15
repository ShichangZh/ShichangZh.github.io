#!/bin/bash
conda init
conda activate jemdoc

# Find all *.jemdoc files and compile them with jemdoc
find . -name "*.jemdoc" -type f | while read -r file; do
    jemdoc "$file"
done
