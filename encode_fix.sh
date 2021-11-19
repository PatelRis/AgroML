#!bin/bash

echo "Original\n"
file -bi CropDesc.csv
file -bi disease_info.csv

iconv -c -t ascii CropDesc.csv -o newC.csv
rm -f CropDesc.csv
mv newC.csv CropDesc.csv

iconv -c -t ascii disease_info.csv -o newD.csv
rm -f disease_info.csv
mv newD.csv disease_info.csv

echo "PostScript\n"
file -bi CropDesc.csv
file -bi disease_info.csv


