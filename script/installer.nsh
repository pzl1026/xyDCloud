!macro customInstall
  WriteRegStr HKCR "CenDC" "URL Protocol" ""
  WriteRegStr HKCR "CenDC" "" "URL:CenDC Protocol Handler"
  WriteRegStr HKCR "CenDC\shell\open\command" "" '"$INSTDIR\CenDC.exe" "%1"'
!macroend