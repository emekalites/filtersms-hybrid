var filterDB = null;
angular.module('filterApp', ['ionic', 'ionic-material', 'filterApp.controllers', 'ngCordova', 'templates'])
    .run(function($ionicPlatform, $cordovaSQLite) {
        $ionicPlatform.ready(function() {
            if(window.cordova && window.cordova.plugins.Keyboard) { cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true); }
            if(window.StatusBar) { StatusBar.styleDefault();}
            if(window.cordova) { filterDB = $cordovaSQLite.openDB({ name: "filterDB.db" }); }
            else { filterDB = window.openDatabase("filterDB.db", "1", "filterSMSDB", 10000); }
            $cordovaSQLite.execute(filterDB, "CREATE TABLE IF NOT EXISTS contactList (id INTEGER PRIMARY KEY AUTOINCREMENT, contact TEXT)");
            $cordovaSQLite.execute(filterDB, "CREATE TABLE IF NOT EXISTS deviceOptions (id INTEGER PRIMARY KEY AUTOINCREMENT, idx INTEGER NOT NULL, ibought INTEGER, device_info TEXT, notification INTEGER NOT NULL, paymethod TEXT, country TEXT, phone_number TEXT)");
            navigator.splashscreen.hide();
        });
    })
    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
        $ionicConfigProvider.views.maxCache(0);
        $stateProvider
            .state('main', {
                url : '/main',
                templateUrl : 'menu.html',
                abstract : true,
                controller : 'MainCtrl'
            })
            .state('main.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'home.html',
                        controller: 'FilterCtrl'
                    }
                }
            })
            .state('main.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })
            .state('main.inbox', {
                url: '/inbox',
                views: {
                    'menuContent': {
                        templateUrl: 'showInbox.html',
                        controller: 'InboxCtrl'
                    }
                }
            })
            .state('main.phoneBook', {
                url: '/phoneBook',
                views: {
                    'menuContent': {
                        templateUrl: 'showContacts.html',
                        controller: 'PhoneBookCtrl'
                    }
                }
            });
        $urlRouterProvider.otherwise('/main/home');
    });