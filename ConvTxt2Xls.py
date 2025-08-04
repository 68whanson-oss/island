import pandas as pd
import os

# Replace this with the path to your .xcsv file
input_file = "data.xcsv"
output_file = os.path.splitext(input_file)[0] + ".xlsx"

# Read the .xcsv file (assuming it's comma-separated like a regular CSV)
df = pd.read_csv(input_file)

# Write to Excel
df.to_excel(output_file, index=False)

print(f"Converted '{input_file}' to '{output_file}'")
