/**
 * Created by emnity on 4/3/15.
 */

angular.module('filterApp.services', [])
    .factory('FDB', function($cordovaSQLite, $q, $ionicPlatform){
        var self = this;
        self.query = function(query, parameters){
            parameters = parameters || [];
            var q = $q.defer();
            $ionicPlatform.ready(function(){
                $cordovaSQLite.execute(filterDB, query, parameters)
                    .then(function(res){
                        q.resolve(res);
                    }, function(err){
                        q.reject(err);
                    });
            });
            return q.promise;
        };

        self.getAll = function(res){
            var contacts = [];
            for(var i=0; i<res.rows.length; i++){
                contacts.push({
                    id: res.rows.item(i).id,
                    number: res.rows.item(i).contact
                });
            }
            return contacts;
        };

        self.getById = function(res){
            var contact = null;
            contact = angular.copy(res.rows.item(0));
            return contact;
        };


        self.getAllOptions = function(res){
            var settings_ = [];
            for(var i=0; i<res.rows.length; i++){
                settings_.push({
                    id: res.rows.item(i).id,
                    idx: res.rows.item(i).idx,
                    iBought: res.rows.item(i).ibought,
                    iPaymentMethod: res.rows.item(i).paymethod,
                    iDeviceInfo: res.rows.item(i).device_info,
                    iNotification: res.rows.item(i).notification,
                    iCountry: res.rows.item(i).country,
                    iPhoneNumber: res.rows.item(i).phone_number
                });
            }
            return settings_;
        };

        self.lastId = function(res){
            return res.insertId;
        };

        return self;
    })

    .factory('Contacts', function($cordovaSQLite, FDB){
        var self = this;

        self.all = function(){
            return FDB.query("SELECT id, contact FROM contactList")
                .then(function(result){
                    return FDB.getAll(result);
                });
        };

        self.get = function(id){
            var param = [id];
            return FDB.query("SELECT id, contact FROM contactList WHERE id = (?)", param)
                .then(function(result){
                    return FDB.getById(result);
                });
        };

        self.getCheck = function(contact){
            var param = [contact];
            return FDB.query("SELECT id, contact FROM contactList WHERE contact = (?)", param)
                .then(function(result){
                    var rs = [];
                    rs.push({ rowLength: result.rows.length, item: contact });
                    return rs;
                });
        };

        self.add = function(contact){
            var params = [null, contact];
            return FDB.query("INSERT INTO contactList (id, contact) VALUES (?,?)", params)
                .then(function(result){
                    return FDB.lastId(result);
                });
        };

        self.remove = function(id){
            var param = [id];
            return FDB.query("DELETE FROM contactList WHERE id = (?)", param);
        };

        return self;
    })

    .factory('FilterOptions', function($cordovaSQLite, FDB){
        var self = this;

        self.all = function(id){
            var param = [id];
            return FDB.query("SELECT id, idx, ibought, paymethod, device_info, notification, country, phone_number FROM deviceOptions WHERE idx = (?)", param)
                .then(function(result){
                    return FDB.getAllOptions(result);
                });
        };

        self.add = function(idx, bought, deviceInfo, notification){
            var params = [null, idx, bought, deviceInfo, notification];
            return FDB.query("SELECT * FROM deviceOptions WHERE idx = (?)", [idx])
                .then(function(result){
                    if(result.rows.length < 1){
                        return FDB.query("INSERT INTO deviceOptions (id, idx, ibought, device_info, notification) VALUES (?,?,?,?,?)", params)
                            .then(function(){});
                    }
                });
        };

        self.update = function(idx, param, opt){
            var params = [param, idx];
            if(opt=='notification') {
                return FDB.query("UPDATE deviceOptions SET notification = (?) WHERE idx = (?)", params);
            }
            else if(opt=='deviceInformation'){
                return FDB.query("UPDATE deviceOptions SET device_info = (?) WHERE idx = (?)", params);
            }
            else if(opt=='hasPurchased'){
                return FDB.query("UPDATE deviceOptions SET ibought = (?), paymethod = (?) WHERE idx = (?)", [param.b, param.m, idx]);
            }
        };

        self.remove = function(id){
            var param = [id];
            return FDB.query("DELETE FROM deviceOptions WHERE idx = (?)", param);
        };

        return self;
    });