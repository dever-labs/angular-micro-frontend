cd angular-libs
npm install
ng build broker --configuration production

cd ..
cd angular-menu
npm install
ng build --configuration production

cd ..
cd angular-overview
npm install
ng build --configuration production

cd ..
cd angular-toolbar
npm install
Remove-Item -Path node_modules/@czprz -Recurse
Copy-Item -Path ../angular-libs/dist/broker -Destination node_modules/@czprz/broker -Recurse -Force
ng build --configuration production

cd ..
cd angular-shell
npm install
Remove-Item -Path node_modules/@czprz -Recurse
Copy-Item -Path ../angular-libs/dist/broker -Destination node_modules/@czprz/broker -Recurse -Force
ng build --configuration production
