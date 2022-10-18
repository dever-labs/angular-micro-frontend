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
Copy-Item -Path ../angular-libs/dist/broker -Destination node_modules/@czprz/broker -Force
ng build --configuration production

cd ..
cd angular-shell
npm install
Copy-Item -Path ../angular-libs/dist/broker -Destination node_modules/@czprz/broker -Force
ng build --configuration production
