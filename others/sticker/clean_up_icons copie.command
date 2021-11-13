mydir="$(dirname "$BASH_SOURCE")"
search='width="32" height="32" '
replace=''


mkdir $mydir/clean
for file in $mydir/*.svg
do
    # echo $file
    filename=$(basename "$file")
    filename="${filename%.*}-$(basename "$mydir")"
    sed -i '' -e "s/<g .*>/<g>/" "$file"
    sed -i '' "s/$search/$replace/" "$file"
    sed -i '' -e '/<defs>/,/<\/defs>/d' "$file"
    picosvg "$file"  >> "$mydir/clean/$filename.svg";
done
exit 0;

# sed -i '' -e '/fill/,/<\/defs>/d' "arrowFatLineDownLeft.svg"
# picosvg "arrowFatLineDownLeft.svg"  >> "clean/arrowFatLineDownLeft.svg";

