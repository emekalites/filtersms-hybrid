/**
 * Created by emnity on 6/27/15.
 */
angular.module('filterApp.controllers', ['filterApp.services'])
    .filter('removeSpaces', [function() {
        return function(string) {
            if (/[a-zA-Z]/.test(string)) {
                return string;
            }
            return string.replace(/[\s]/g, '');
        };
    }])
    .controller('MainCtrl', function($scope) {
        $scope.isExpanded = false;
        $scope.data = { showDelete: false };

        var navIcons = document.getElementsByClassName('ion-navicon');
        for (var i = 0; i < navIcons.length; i++) {
            navIcons.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        }

        ////////////////////////////////////////
        // Layout Methods
        ////////////////////////////////////////

        $scope.hideNavBar = function() {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
        };

        $scope.showNavBar = function() {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
        };

        $scope.noHeader = function() {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }
        };

        $scope.setExpanded = function(bool) {
            $scope.isExpanded = bool;
        };

        $scope.hasHeader = function() {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (!content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }

        };

        $scope.hideHeader = function() {
            $scope.hideNavBar();
            $scope.noHeader();
        };

        $scope.showHeader = function() {
            $scope.showNavBar();
            $scope.hasHeader();
        };
    })
    .controller('FilterCtrl', function($scope, $ionicModal, $ionicPopup, $cordovaDevice, Contacts, FilterOptions, $location, $timeout){
        FilterOptions.add(3,0,'{}',1);
        $scope.data = { showDelete: false };
        $scope.$parent.showHeader();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.iPaid = { status: false };
        $scope.irPaid = { status: false };
        $scope.iPayment = '';
        var admobid = {};
        if( /(android)/i.test(navigator.userAgent) ) {
            admobid = {
                banner: 'ca-app-pub-1751974729906432/2940424701',
                interstitial: 'ca-app-pub-1751974729906432/5195887105'
            };
        } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
            admobid = {
                banner: 'ca-app-pub-1751974729906432/2940424701',
                interstitial: 'ca-app-pub-1751974729906432/5195887105'
            };
        } else {
            admobid = {
                banner: 'ca-app-pub-1751974729906432/2940424701',
                interstitial: 'ca-app-pub-1751974729906432/5195887105'
            };
        }
        $scope.initApp = function() {
            if(AdMob) {
                AdMob.createBanner({
                    adId: admobid.banner,
                    position: AdMob.AD_POSITION.BOTTOM_CENTER,
                    autoShow: false,
                    isTesting: false
                });

                AdMob.prepareInterstitial({
                    adId:admobid.interstitial,
                    autoShow:false
                });
            }
        };
        var myDevice;
        var smsPlugin;
        document.addEventListener('deviceready', function () {
            $scope.initApp();
            AdMob.removeBanner();
            var inappbilling = window.plugins.inappbilling;
            inappbilling.init(function(rsInit) {
                    inappbilling.getPurchases(function(result) {
                            if(result.length > 0){
                                if(!$scope.irPaid.status){
                                    FilterOptions.update(3, { b:1, m:'store' }, 'hasPurchased');
                                    $scope.iPaid = { status: true };
                                    $scope.irPaid = { status: true };
                                    $scope.iPayment = 'store';
                                }
                            }
                        },
                        function(errorPurchases) {});
                },
                function(errorInit) {},
                {showLog: false},
                ["filtersmspro"]);
            window.analytics.startTrackerWithId('UA-53444694-18', function(err){}, function(err){});
            window.analytics.trackView('Default view', function(err){}, function(err){});
            myDevice = JSON.stringify($cordovaDevice.getDevice());
            smsPlugin = cordova.require("info.asankan.phonegap.smsplugin.smsplugin");
            smsPlugin.isSupported(function(x){},function(err){});
            smsPlugin.startReception(function(x){
                var sms = x.split(">");
                //console.error("Number: " + sms[0] + ", SMS: " + sms[1]);
            },function(err){});
        }, false);

        $scope.settings = [];
        $scope.contacts = [];
        $scope.contacts = null;
        //Device options start
        $scope.selectOptions = function(i){
            FilterOptions.all(i).then(function(msettings){
                if(msettings.length < 1) {
                    setTimeout(function(){ FilterOptions.update(3, myDevice, 'deviceInformation'); }, 5000);
                }
                $scope.settings = msettings[0];
            });
        };
        //Device options end
        $scope.selectContacts = function(){
            Contacts.all().then(function(contacts){
                $scope.contacts = contacts;
            });
        };
        $scope.selectContacts();

        $scope.removeContact = function(contact) {
            Contacts.remove(contact);
        };
        $scope.selectOptions(3);

        $scope.checkIfPaid = function(){
            FilterOptions.all(3).then(function(res){
                if(res.length > 0) {
                    $scope.irPaid = { status: Boolean(res[0].iBought) };
                    if (res[0].iBought === 0) {
                        Contacts.all().then(function (contacts) {
                            var counts = contacts.length;
                            if (counts < 4) {
                                $scope.iPaid = { status: true };
                            }
                            else {
                                $scope.iPaid = { status: false };
                            }
                        });
                        AdMob.showBanner(8);
                    }
                    else {
                        $scope.iPaid = { status: true };
                        if(res[0].iPaymentMethod == 'store'){
                            $scope.iPayment = 'store';
                            AdMob.removeBanner();
                        }
                        else {
                            $scope.iPayment = 'carrier';
                            AdMob.showBanner(8);
                        }
                    }
                }
                else {
                    $scope.iPaid = { status: true };
                    $scope.irPaid = { status: false };
                    AdMob.showBanner(8);
                }
            });
        };
        $scope.checkIfPaid();

        $scope.doRefresh = function() {
            console.log('refresh');
            $scope.contacts = [];
            $scope.selectContacts();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$apply();
            if($scope.irPaid.status && $scope.iPayment=='store') {} else { AdMob.showInterstitial(); }
        };
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState) {
            if(fromState.name !=='') {
                $timeout(function () {
                    if ($location.path() == "/main/home") {
                        console.log('refresh');
                        $scope.doRefresh();
                        $timeout(function () {
                            $scope.doRefresh();
                        }, 5000);
                    }
                }, 500);
            }
        });
        $scope.deleteAll = function(){
            var confirmPopup = $ionicPopup.confirm({title: '<i class="ion-alert-circled"></i>Delete Contacts', template: 'Are you sure you want to delete all contacts?', buttons: [{text: 'Cancel',onTap: function(e){ return null; }},{text: 'Delete',onTap: function(e){ return true; }}]});
            confirmPopup.then(function(res) {
                if(res) {
                    for(var i=0; i<$scope.contacts.length; i++){
                        $scope.removeContact($scope.contacts[i].id);
                    }
                    $scope.checkIfPaid();
                    $scope.selectContacts();
                }
                $scope.data = { showDelete: false };
            });
        };
        $scope.showConfirm = function(id) {
            var confirmPopup = $ionicPopup.confirm({title: '<i class="ion-alert-circled"></i>Delete Contact', template: 'Are you sure you want to delete this contact?', buttons: [{text: 'Cancel',onTap: function(e){ return null; }},{text: 'Delete',onTap: function(e){ return true; }}]});
            confirmPopup.then(function(res) {
                if(res) { $scope.removeContact(id);$scope.checkIfPaid();$scope.selectContacts(); }
                $scope.data = { showDelete: false };
            });
        };

        $scope.deleteItem = function(id){
            $scope.showConfirm(id);
        };
        $scope.deleteAllItems = function(){
            $scope.deleteAll();
        };


        /*! Add number
        *******************************/
        $scope.insertContact = function(contact) {
            Contacts.getCheck(contact).then(function(x_){
                var x = x_[0];
                if(x.rowLength < 1){
                    Contacts.add(x.item);
                    $scope.checkIfPaid();
                    $scope.contacts = [];
                    $scope.selectContacts();
                    cordova.plugins.Keyboard.close();
                }
                else {
                    $scope.showAlert = function() {
                        $ionicPopup.alert({
                            title: '<i class="ion-alert-circled"></i> Error!',
                            template: 'Contact [' + contact + '] already exists',
                            okText: 'Ok',
                            okType: 'button-calm'
                        });
                    };
                }
            });
        };

        $ionicModal.fromTemplateUrl('add_dialog.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) { $scope.modal = modal; });
        $scope.showSelectList = function() {$scope.modal.show();$scope.data = { showDelete: false };};
        $scope.closeSelectList = function() {$scope.modal.hide();};
        $scope.$on('$destroy', function() {$scope.modal.remove();});
        $scope.$on('modal.hidden', function() {$scope.data = { showDelete: false };});
        $scope.$on('modal.removed', function() {});
        $scope.$on('modal.shown', function(){$(".modal-backdrop").on('click', function(){$scope.closeSelectList();});});

        $scope.showPopup = function(){
            $scope.contact = {};
            var addNewNo = $ionicPopup.show({
                template: '<input ng-model="contact.number" type="text" placeholder="Phone number">',
                title: '<i class="ion-android-add-circle"></i>Add new phone number',
                scope: $scope,
                buttons: [
                    {
                        text: 'Save',
                        onTap: function(e){
                            if($scope.contact.number !== undefined) {
                                return $scope.contact.number;
                            }
                            else {
                                $scope.showAlert();
                                e.preventDefault();
                            }
                        }
                    },
                    {
                        text: 'Cancel',
                        onTap: function(){
                            return null;
                        }
                    }
                ]
            });
            addNewNo.then(function(res){ if(res !== null && res !== undefined) {
                $scope.insertContact(res);
            } else {} });
            $scope.showAlert = function() {
                var alertPopup = $ionicPopup.alert({
                    title: '<i class="ion-alert-circled"></i>Error',
                    cssClass: 'alert-box',
                    template: 'Please do not leave it empty!'
                });
            };
        };
    })
    .controller('InboxCtrl', function($scope, Contacts, $state, $ionicLoading, $ionicHistory){
        $scope.data = { showDelete: false };
        $scope.$parent.showHeader();
        $scope.$parent.setExpanded(false);
        $scope.isExpanded = false;
        var smsPlugin = cordova.require("info.asankan.phonegap.smsplugin.smsplugin");
        $scope.numberToDisplay = 8;
        $scope.moreDataCanBeLoaded = false;

        $scope.inboxContacts = [];
        $scope.mContacts = [];
        $scope.mnContacts = [];

        $ionicLoading.show({
            template: '<i class="icon ion-loading-c"></i>',
            hideOnStateChange: true
        });
        smsPlugin.listSms(function(x){
            for(var i=0; i< x.length; i++){
                $scope.mContacts.push({
                    number: x[i].address
                });
            }
            console.error($scope.mContacts.length);
            var arr = [], collection = [];
            $.each($scope.mContacts, function (index, value) {
                if ($.inArray(value.number, arr) == -1) {
                    arr.push(value.number);
                    collection.push({
                        number:value.number
                    });
                }
            });
            $scope.mnContacts = collection;
            console.error($scope.mnContacts.length);

            $scope.inboxContacts = $scope.mnContacts;
            $ionicLoading.hide();

            $scope.loadMore = function() {
                if($scope.inboxContacts.length > $scope.numberToDisplay){
                    $scope.numberToDisplay += 10;
                }
                console.error($scope.numberToDisplay);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if($scope.inboxContacts.length < $scope.numberToDisplay){
                    $scope.moreDataCanBeLoaded = true;
                }
            };

            $scope.$on('$stateChangeSuccess', function() {
                $scope.loadMore();
            });
        },function(err){});

        $scope.selection = [];

        $scope.toggleSelection = function toggleSelection(con) {
            var idx = $scope.selection.indexOf(con);
            if (idx > -1) {
                $scope.selection.splice(idx, 1);
            }
            else {
                $scope.selection.push(con);
            }
        };
        $scope.checkContacts = function(cn){
            Contacts.getCheck(cn).then(function(x_){
                var x = x_[0];
                if(x.rowLength < 1){
                    Contacts.add(x.item);
                }
            });
        };
        $scope.addContacts = function(){
            for(var i=0; i<$scope.selection.length; i++){
                $scope.checkContacts($scope.selection[i]);
            }
            $ionicHistory.clearCache();
            $state.go('main.home');
        };
        $scope.counter = 0;
        $scope.checkAll = function() {
            if($scope.counter % 2 === 0){
                var nContacts = _.pluck($scope.inboxContacts, 'number');
                $scope.nAddition = _.difference(nContacts, $scope.selection);
                for(var i=0; i<$scope.nAddition.length; i++){
                    $scope.selection.push($scope.nAddition[i]);
                }
            }
            else{
                $scope.selection = [];
            }
            $scope.counter++;
        };
    })
    .controller('PhoneBookCtrl', function($scope, $rootScope, $cordovaContacts, Contacts, $ionicLoading, $ionicHistory, $state){
        $scope.data = { showDelete: false };
        $scope.$parent.showHeader();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);

        $scope.numberToDisplay = 6;
        $scope.moreCanBeLoaded = false;
        $scope.mContacts = [];
        $scope.phoneContacts = [];

        $ionicLoading.show({
            template: '<i class="icon ion-loading-c"></i>',
            hideOnStateChange: true
        });
        $cordovaContacts.find({filter: ''}).then(function(res) {
            for(var i=0; i<res.length; i++){
                if(res[i].phoneNumbers !== null) {
                    for (var j = 0; j < res[i].phoneNumbers.length; j++) {
                        $scope.phoneContacts.push({
                            displayName: res[i].displayName,
                            number: res[i].phoneNumbers[j].value
                        });
                    }
                }
            }
            console.error("List Received:" + $scope.phoneContacts.length);
            //$scope.phoneContacts = $scope.mContacts;

            $ionicLoading.hide();

            $scope.loadPMore = function() {
                if($scope.phoneContacts.length > $scope.numberToDisplay){
                    $scope.numberToDisplay += 10;
                }
                console.error($scope.numberToDisplay);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if($scope.phoneContacts.length < $scope.numberToDisplay){
                    $scope.moreCanBeLoaded = true;
                }
            };
            $scope.loadPMore();
        }, function(error) {});
        $scope.selection = [];
        $scope.toggleSelection = function toggleSelection(con) {
            var idx = $scope.selection.indexOf(con);
            if (idx > -1) {
                $scope.selection.splice(idx, 1);
            }
            else {
                $scope.selection.push(con);
            }
        };
        //TODO: leave leading zero
        $scope.removeLeadingZero = function(n){
            if(n.substr(0,1) == "0" && n.length == 11) {
                return "+234" + n.replace(/^0/, "");
            }
            return n;
        };
        $scope.checkContacts = function(cn){
            Contacts.getCheck(cn).then(function(x_){
                var x = x_[0];
                if(x.rowLength < 1){
                    Contacts.add(x.item);
                }
            });
        };
        $scope.addContacts = function(){
            for(var i=0; i<$scope.selection.length; i++){
                $scope.aNumber = '';
                if(/[a-zA-Z]/.test($scope.selection[i])){
                    $scope.aNumber = $scope.selection[i];
                }
                else{
                    $scope.aNumber = $scope.removeLeadingZero($scope.selection[i].replace(/[\s]/g, ''));
                }
                $scope.checkContacts($scope.aNumber);
            }
            $ionicHistory.clearCache();
            $state.go('main.home');
        };
        $scope.counter = 0;
        $scope.checkAll = function() {
            if($scope.counter % 2 === 0){
                var nContacts = _.pluck($scope.phoneContacts, 'number');
                $scope.nAddition = _.difference(nContacts, $scope.selection);
                for(var i=0; i<$scope.nAddition.length; i++){
                    $scope.selection.push($scope.nAddition[i]);
                }
            }
            else{
                $scope.selection = [];
            }
            console.log("Selection: " + JSON.stringify($scope.selection));
            $scope.counter++;
        };
    })
    .controller('SettingsCtrl', function($scope, FilterOptions, $ionicPopup, $window){
        var inappbilling = window.plugins.inappbilling;
        $window.open_my_uri = function(uri){
            var ref = window.open(uri, '_system', 'location=yes');
        };
        var admobid = {};
        if( /(android)/i.test(navigator.userAgent) ) {
            admobid = {
                banner: 'ca-app-pub-1751974729906432/2940424701',
                interstitial: 'ca-app-pub-1751974729906432/5195887105'
            };
        } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
            admobid = {
                banner: 'ca-app-pub-1751974729906432/2940424701',
                interstitial: 'ca-app-pub-1751974729906432/5195887105'
            };
        } else {
            admobid = {
                banner: 'ca-app-pub-1751974729906432/2940424701',
                interstitial: 'ca-app-pub-1751974729906432/5195887105'
            };
        }
        AdMob.removeBanner();
        $scope.data = { showDelete: false };
        $scope.$parent.showHeader();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);

        FilterOptions.all(3).then(function(res){
            $scope.notificationStatus = { checked: Boolean(res[0].iNotification), status: 'off' };
            $scope.iPaid = { status: Boolean(res[0].iBought) };
            $scope.irPaid = { status: Boolean(res[0].iBought) };
        });
        document.addEventListener('deviceready', function () {
            if (AdMob) {
                AdMob.createBanner({
                    adId: admobid.banner,
                    position: AdMob.AD_POSITION.BOTTOM_CENTER,
                    autoShow: false,
                    isTesting: false
                });
            }
        }, false );

        FilterOptions.all(3).then(function(res){
            if(res.length > 0) {
                if (res[0].iBought === 0) {
                    AdMob.showBanner(8);
                }
                else {
                    if(res[0].iPaymentMethod == 'store'){
                        AdMob.removeBanner();
                    }
                    else {
                        AdMob.showBanner(8);
                    }
                }
            }
            else {
                AdMob.showBanner(8);
            }
        });

        $scope.notificationChange = function() {
            if($scope.notificationStatus.checked === false){
                $scope.notificationStatus.status = 'on';
                FilterOptions.update(3,0,'notification');
            }
            else {
                $scope.notificationStatus.status = 'off';
                FilterOptions.update(3,1,'notification');
            }
        };

        $scope.buyFromPlayStore = function(){
            inappbilling.buy(function(data) {
                    FilterOptions.update(3, { b:1, m:'store' }, 'hasPurchased');
                    $scope.iPaid = { status: true };
                    $scope.irPaid = { status: true };
                    AdMob.removeBanner();
                }, function(errorBuy) {
                    $scope.showAlert = function() {
                        $ionicPopup.alert({
                            title: '<i class="ion-alert-circled"></i> Error!',
                            template: 'Connection error!',
                            okText: 'Ok',
                            okType: 'button-calm'
                        });
                    };
                },
                "filtersmspro");
        };
        $scope.buyWithAirtime = function(){
            FilterOptions.update(3, { b:1, m:'carrier' }, 'hasPurchased');
            $scope.iPaid = { status: true };
            $scope.irPaid = { status: true };
            AdMob.showBanner(8);
        };
    });