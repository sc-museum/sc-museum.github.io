#!/bin/bash
# usage: run.sh room [room...]  -> out/<room>.jpg and out/<room>.json
S="$(cd "$(dirname "$0")" && pwd -W)"; mkdir -p out
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
for r in "$@"; do
  "$CH" --headless=new --disable-gpu-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader --allow-file-access-from-files --virtual-time-budget=60000 --run-all-compositor-stages-before-draw --dump-dom "file:///$S/render.html?room=$r" 2>/dev/null > "out/$r.dom"
  perl -MMIME::Base64 -0777 -ne 'm{<pre id="out">(.*?)</pre>}s or die "no out\n"; my $t=$1; if($t!~/\@\@JPG\@\@/){print STDERR "FAIL '"$r"': ".substr($t,0,600)."\n"; exit 1} my($j,$b)=split /\n\@\@JPG\@\@data:image\/jpeg;base64,/,$t; $j=~s/&quot;/"/g; $j=~s/&amp;/&/g; open my $f,">","out/'"$r"'.json"; print $f $j; open my $g,">:raw","out/'"$r"'.jpg"; print $g decode_base64($b); print "'"$r"' ok ".length(decode_base64($b))." bytes\n"' "out/$r.dom"
done
