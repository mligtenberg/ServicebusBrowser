(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /home/martin/projects/ServicebusExplorer/frontend/src/main.ts */"zUnb");


/***/ }),

/***/ 1:
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 2:
/*!*********************!*\
  !*** net (ignored) ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 3:
/*!*********************!*\
  !*** tls (ignored) ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ "4QyE":
/*!*********************************************************!*\
  !*** ./src/app/connections/ngrx/connections.actions.ts ***!
  \*********************************************************/
/*! exports provided: createConnection, selectConnection, deleteConnection, storeSelectedConnection, clearSelectedConnection, setSelectedConnectionName, testConnection, testConnectionFailed, testConnectionSuccess */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createConnection", function() { return createConnection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectConnection", function() { return selectConnection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteConnection", function() { return deleteConnection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "storeSelectedConnection", function() { return storeSelectedConnection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearSelectedConnection", function() { return clearSelectedConnection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setSelectedConnectionName", function() { return setSelectedConnectionName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testConnection", function() { return testConnection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testConnectionFailed", function() { return testConnectionFailed; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testConnectionSuccess", function() { return testConnectionSuccess; });
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ngrx/store */ "l7P3");

// basic connection operations
var createConnection = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[Connection] create a empty connection and load it as selected');
var selectConnection = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[connection] load an exsiting connection as selected', Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["props"])());
var deleteConnection = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[Connection] Delete a specified connection', Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["props"])());
// selected connection operations
var storeSelectedConnection = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[Connection/Selected] store the selected connection and clear the selection');
var clearSelectedConnection = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[Connection/Selected] clear the currently selected connection');
var setSelectedConnectionName = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[Connection/Selected] Set the name of the selected connection', Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["props"])());
var testConnection = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[Connection/Selected] Test a given connection');
var testConnectionFailed = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[Connection/Selected] Test of given connection failed', Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["props"])());
var testConnectionSuccess = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createAction"])('[Connection/Selected] Test of given connection success');


/***/ }),

/***/ "7+jg":
/*!********************************!*\
  !*** ./src/app/ngrx.module.ts ***!
  \********************************/
/*! exports provided: NgrxModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NgrxModule", function() { return NgrxModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ngrx/store */ "l7P3");




var NgrxModule = /** @class */ (function () {
    function NgrxModule() {
    }
    NgrxModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: NgrxModule });
    NgrxModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function NgrxModule_Factory(t) { return new (t || NgrxModule)(); }, imports: [[
                _ngrx_store__WEBPACK_IMPORTED_MODULE_1__["StoreModule"].forRoot({})
            ]] });
    return NgrxModule;
}());

(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](NgrxModule, { imports: [_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["StoreRootModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](NgrxModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [],
                imports: [
                    _ngrx_store__WEBPACK_IMPORTED_MODULE_1__["StoreModule"].forRoot({})
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "8l7x":
/*!*************************************************!*\
  !*** ./src/app/ui/menubar/menubar.component.ts ***!
  \*************************************************/
/*! exports provided: MenubarComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MenubarComponent", function() { return MenubarComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


var _c0 = ["*"];
var MenubarComponent = /** @class */ (function () {
    function MenubarComponent() {
    }
    MenubarComponent.prototype.ngOnInit = function () {
    };
    MenubarComponent.ɵfac = function MenubarComponent_Factory(t) { return new (t || MenubarComponent)(); };
    MenubarComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: MenubarComponent, selectors: [["app-menubar"]], ngContentSelectors: _c0, decls: 2, vars: 0, consts: [[1, "container"]], template: function MenubarComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojection"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        } }, styles: [".container[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 30px;\n  background-color: #1377b5;\n  border-bottom: solid 1px #0e5887;\n  box-sizing: border-box;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL21lbnViYXIuY29tcG9uZW50LnNjc3MiLCIuLi8uLi8uLi8uLi8uLi9tZW51Q29uZmlnLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0E7RUFDSSxXQUFBO0VBQ0EsWUNMVTtFRE1WLHlCQUFBO0VBQ0EsZ0NBQUE7RUFDQSxzQkFBQTtBQUZKIiwiZmlsZSI6Im1lbnViYXIuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJAaW1wb3J0IFwiLi8uLi8uLi8uLi9zdHlsaW5nL2NvbG9yc2NoZW1lLnNjc3NcIjtcbkBpbXBvcnQgXCIuLy4uL21lbnVDb25maWcuc2Nzc1wiO1xuXG4uY29udGFpbmVyIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6ICRtZW51LWhlaWdodDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiBkYXJrZW4oJGFjY2VudCwgMTAlKTtcbiAgICBib3JkZXItYm90dG9tOiBzb2xpZCAxcHggZGFya2VuKCRhY2NlbnQsIDIwJSk7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbn0iLCIkbWVudS1oZWlnaHQ6IDMwcHg7XG4kbWVudS1zcGFjaW5nOiAxMnB4O1xuJHN1Ym1lbnUtd2lkdGg6IDIwMHB4OyJdfQ== */"], changeDetection: 0 });
    return MenubarComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](MenubarComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-menubar',
                templateUrl: './menubar.component.html',
                styleUrls: ['./menubar.component.scss'],
                changeDetection: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectionStrategy"].OnPush
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "9ezh":
/*!**********************************************************!*\
  !*** ./src/app/connections/ngrx/connections.reducers.ts ***!
  \**********************************************************/
/*! exports provided: connectionReducer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "connectionReducer", function() { return connectionReducer; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ngrx/store */ "l7P3");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! uuid */ "4USb");
/* harmony import */ var _connections_actions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./connections.actions */ "4QyE");
/* harmony import */ var _connections_models__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./connections.models */ "hHq3");





var initialState = {
    connections: [],
    selectedConnection: null
};
var connectionReducer = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["createReducer"])(initialState, Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["on"])(_connections_actions__WEBPACK_IMPORTED_MODULE_3__["createConnection"], function (state) {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state), { selectedConnection: {
            id: undefined,
            name: '',
            testSuccess: null,
            connectionType: _connections_models__WEBPACK_IMPORTED_MODULE_4__["ConnectionType"].connectionString,
            connectionDetails: {
                connetionString: ''
            }
        } });
}), Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["on"])(_connections_actions__WEBPACK_IMPORTED_MODULE_3__["clearSelectedConnection"], function (state) {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state), { selectedConnection: null });
}), Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["on"])(_connections_actions__WEBPACK_IMPORTED_MODULE_3__["selectConnection"], function (state, action) {
    var _a;
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state), { selectedConnection: (_a = state.connections.find(function (c) { return c.id === action.id; })) !== null && _a !== void 0 ? _a : null });
}), Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["on"])(_connections_actions__WEBPACK_IMPORTED_MODULE_3__["deleteConnection"], function (state, action) {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state), { connections: state.connections.filter(function (c) { return c.id !== action.id; }) });
}), 
// selected connections
Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["on"])(_connections_actions__WEBPACK_IMPORTED_MODULE_3__["storeSelectedConnection"], function (state) {
    if (state.selectedConnection === null) {
        return state;
    }
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state), { connections: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spread"])(state.connections.filter(function (c) { var _a; return c.id != ((_a = state.selectedConnection) === null || _a === void 0 ? void 0 : _a.id); }), [
            Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state.selectedConnection), { id: state.selectedConnection.id === undefined ? Object(uuid__WEBPACK_IMPORTED_MODULE_2__["v4"])() : state.selectedConnection.id })
        ]), selectedConnection: null });
}), Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["on"])(_connections_actions__WEBPACK_IMPORTED_MODULE_3__["setSelectedConnectionName"], function (state, action) {
    if (state.selectedConnection === null) {
        return state;
    }
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state), { selectedConnection: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state.selectedConnection), { name: action.name }) });
}), Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["on"])(_connections_actions__WEBPACK_IMPORTED_MODULE_3__["testConnectionSuccess"], function (state) {
    if (state.selectedConnection === null) {
        return state;
    }
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state), { selectedConnection: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state.selectedConnection), { testSuccess: true, error: '' }) });
}), Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["on"])(_connections_actions__WEBPACK_IMPORTED_MODULE_3__["testConnectionFailed"], function (state, action) {
    if (state.selectedConnection === null) {
        return state;
    }
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state), { selectedConnection: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, state.selectedConnection), { testSuccess: false, error: action.error }) });
}));


/***/ }),

/***/ "ARvF":
/*!****************************************************************************!*\
  !*** ./src/app/connections/connection-plane/connection-plane.component.ts ***!
  \****************************************************************************/
/*! exports provided: ConnectionPlaneComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConnectionPlaneComponent", function() { return ConnectionPlaneComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _ngrx_connections_selectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ngrx/connections.selectors */ "Spk+");
/* harmony import */ var subsink__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! subsink */ "33Jv");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngrx/store */ "l7P3");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _connection_plane_item_connection_plane_item_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../connection-plane-item/connection-plane-item.component */ "N6MK");







function ConnectionPlaneComponent_app_connection_plane_item_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "app-connection-plane-item", 1);
} if (rf & 2) {
    var connection_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("connection", connection_r1);
} }
var ConnectionPlaneComponent = /** @class */ (function () {
    function ConnectionPlaneComponent(store) {
        this.store = store;
        this.connections = [];
        this.subs = new subsink__WEBPACK_IMPORTED_MODULE_2__["SubSink"]();
    }
    ConnectionPlaneComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subs.add(this.store.select(_ngrx_connections_selectors__WEBPACK_IMPORTED_MODULE_1__["getConnections"]).subscribe(function (c) { return _this.connections = c; }));
    };
    ConnectionPlaneComponent.prototype.ngOnDestroy = function () {
        this.subs.unsubscribe();
    };
    ConnectionPlaneComponent.ɵfac = function ConnectionPlaneComponent_Factory(t) { return new (t || ConnectionPlaneComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngrx_store__WEBPACK_IMPORTED_MODULE_3__["Store"])); };
    ConnectionPlaneComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ConnectionPlaneComponent, selectors: [["app-connection-plane"]], decls: 1, vars: 1, consts: [[3, "connection", 4, "ngFor", "ngForOf"], [3, "connection"]], template: function ConnectionPlaneComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, ConnectionPlaneComponent_app_connection_plane_item_0_Template, 1, 1, "app-connection-plane-item", 0);
        } if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.connections);
        } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgForOf"], _connection_plane_item_connection_plane_item_component__WEBPACK_IMPORTED_MODULE_5__["ConnectionPlaneItemComponent"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb25uZWN0aW9uLXBsYW5lLmNvbXBvbmVudC5zY3NzIn0= */"] });
    return ConnectionPlaneComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ConnectionPlaneComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-connection-plane',
                templateUrl: './connection-plane.component.html',
                styleUrls: ['./connection-plane.component.scss']
            }]
    }], function () { return [{ type: _ngrx_store__WEBPACK_IMPORTED_MODULE_3__["Store"] }]; }, null); })();


/***/ }),

/***/ "AytR":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "BGbG":
/*!*************************************************!*\
  !*** ./src/app/ui/sidebar/sidebar.component.ts ***!
  \*************************************************/
/*! exports provided: SidebarComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidebarComponent", function() { return SidebarComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


var _c0 = ["*"];
var SidebarComponent = /** @class */ (function () {
    function SidebarComponent() {
    }
    SidebarComponent.prototype.ngOnInit = function () {
    };
    SidebarComponent.ɵfac = function SidebarComponent_Factory(t) { return new (t || SidebarComponent)(); };
    SidebarComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SidebarComponent, selectors: [["app-sidebar"]], ngContentSelectors: _c0, decls: 2, vars: 0, consts: [[1, "sidebar"]], template: function SidebarComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojection"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        } }, styles: [".sidebar[_ngcontent-%COMP%] {\n  background: #212221;\n  height: 100%;\n  width: 300px;\n  overflow: auto;\n  padding: 6px;\n  color: #f7f5f5;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NpZGViYXIuY29tcG9uZW50LnNjc3MiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zdHlsaW5nL2NvbG9yc2NoZW1lLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFDSSxtQkNFaUI7RUREakIsWUFBQTtFQUNBLFlBQUE7RUFDQSxjQUFBO0VBQ0EsWUFBQTtFQUNBLGNBQUE7QUFESiIsImZpbGUiOiJzaWRlYmFyLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiQGltcG9ydCBcIi4vLi4vLi4vLi4vc3R5bGluZy9jb2xvcnNjaGVtZS5zY3NzXCI7XG5cbi5zaWRlYmFyIHtcbiAgICBiYWNrZ3JvdW5kOiAkYmFja2dyb3VuZC1kYXJrZXN0O1xuICAgIGhlaWdodDogMTAwJTtcbiAgICB3aWR0aDogMzAwcHg7XG4gICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgcGFkZGluZzogNnB4O1xuICAgIGNvbG9yOiAkdGV4dC1saWdodDtcbn0iLCIkYmFja2dyb3VuZC1saWdodGVzdDogI2Y3ZjVmNTtcbiRiYWNrZ3JvdW5kLWxpZ2h0ZXI6IGRhcmtlbigkYmFja2dyb3VuZC1saWdodGVzdCwgNSUpO1xuJGJhY2tncm91bmQtbGlnaHQ6IGRhcmtlbigkYmFja2dyb3VuZC1saWdodGVzdCwgMTAlKTtcbiRiYWNrZ3JvdW5kLWRhcms6ICM3NDdjN2M7XG4kYmFja2dyb3VuZC1kYXJrZXI6ICM0NjRiNDU7XG4kYmFja2dyb3VuZC1kYXJrZXN0OiAjMjEyMjIxO1xuXG4kdGV4dDogIzExMTExMTtcbiR0ZXh0LWxpZ2h0OiAjZjdmNWY1O1xuJGFjY2VudDogIzE4OTVlMztcbiRhY2NlbnQtbGlnaHQ6ICM5M2JkY2E7XG5cbiRmb250LWZhbWlseTogXCJIZWx2ZXRpY2FcIiwgc2Fucy1zZXJpZjsiXX0= */"], changeDetection: 0 });
    return SidebarComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SidebarComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-sidebar',
                templateUrl: './sidebar.component.html',
                styleUrls: ['./sidebar.component.scss'],
                changeDetection: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectionStrategy"].OnPush
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "F4tb":
/*!***********************************************************!*\
  !*** ./src/app/connections/connections-routing.module.ts ***!
  \***********************************************************/
/*! exports provided: ConnectionsRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConnectionsRoutingModule", function() { return ConnectionsRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _edit_edit_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./edit/edit.component */ "Ibxp");





var routes = [{ path: 'edit', component: _edit_edit_component__WEBPACK_IMPORTED_MODULE_2__["EditComponent"] }];
var ConnectionsRoutingModule = /** @class */ (function () {
    function ConnectionsRoutingModule() {
    }
    ConnectionsRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: ConnectionsRoutingModule });
    ConnectionsRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function ConnectionsRoutingModule_Factory(t) { return new (t || ConnectionsRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] });
    return ConnectionsRoutingModule;
}());

(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](ConnectionsRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ConnectionsRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "Ibxp":
/*!****************************************************!*\
  !*** ./src/app/connections/edit/edit.component.ts ***!
  \****************************************************/
/*! exports provided: EditComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EditComponent", function() { return EditComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ngrx/connections.actions */ "4QyE");
/* harmony import */ var _ngrx_connections_selectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ngrx/connections.selectors */ "Spk+");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngrx/store */ "l7P3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "ofXK");







function EditComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    var _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "input", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("change", function EditComponent_div_3_Template_input_change_1_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r2); var ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r1.onNameChange($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "button", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function EditComponent_div_3_Template_button_click_2_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r2); var ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r3.test(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, "Test");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "button", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function EditComponent_div_3_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r2); var ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r4.save(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "Save");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    var ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("value", ctx_r0.selectedConnection.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("disabled", ctx_r0.selectedConnection.testSuccess);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("disabled", !ctx_r0.selectedConnection.testSuccess);
} }
var EditComponent = /** @class */ (function () {
    function EditComponent(store, router) {
        this.store = store;
        this.router = router;
        this.selectedConnection = null;
    }
    EditComponent.prototype.ngOnInit = function () {
        var _this = this;
        // TODO: Unsubscribe
        this.store.select(_ngrx_connections_selectors__WEBPACK_IMPORTED_MODULE_2__["getSelectedConnection"]).subscribe(function (s) {
            _this.selectedConnection = s;
            if (_this.selectedConnection == null) {
                _this.store.dispatch(Object(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_1__["createConnection"])());
            }
        });
    };
    EditComponent.prototype.onNameChange = function ($event) {
        var element = $event.target;
        this.store.dispatch(Object(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_1__["setSelectedConnectionName"])({
            name: element.value
        }));
    };
    EditComponent.prototype.test = function () {
        if (this.selectedConnection !== null) {
            this.store.dispatch(Object(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_1__["testConnection"])());
        }
    };
    EditComponent.prototype.save = function () {
        this.store.dispatch(Object(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_1__["storeSelectedConnection"])());
        this.router.navigateByUrl('/');
    };
    EditComponent.prototype.cancel = function () {
        this.store.dispatch(Object(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_1__["clearSelectedConnection"])());
        this.router.navigateByUrl('/');
    };
    EditComponent.ɵfac = function EditComponent_Factory(t) { return new (t || EditComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngrx_store__WEBPACK_IMPORTED_MODULE_3__["Store"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"])); };
    EditComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: EditComponent, selectors: [["ng-component"]], decls: 4, vars: 1, consts: [[3, "click"], [4, "ngIf"], ["type", "text", 3, "value", "change"], [3, "disabled", "click"]], template: function EditComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "a", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function EditComponent_Template_a_click_1_listener() { return ctx.cancel(); });
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "Cancel");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, EditComponent_div_3_Template, 6, 3, "div", 1);
        } if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.selectedConnection !== null);
        } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJlZGl0LmNvbXBvbmVudC5zY3NzIn0= */"] });
    return EditComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](EditComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                templateUrl: './edit.component.html',
                styleUrls: ['./edit.component.scss']
            }]
    }], function () { return [{ type: _ngrx_store__WEBPACK_IMPORTED_MODULE_3__["Store"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"] }]; }, null); })();


/***/ }),

/***/ "J65a":
/*!*************************************************!*\
  !*** ./src/app/ui/console/console.component.ts ***!
  \*************************************************/
/*! exports provided: ConsoleComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConsoleComponent", function() { return ConsoleComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "wHSu");
/* harmony import */ var _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @fortawesome/angular-fontawesome */ "6NWb");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "ofXK");





var _c0 = ["logPlane"];
function ConsoleComponent_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    var line_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", line_r2, " ");
} }
var _c1 = function (a0) { return { "open": a0 }; };
var ConsoleComponent = /** @class */ (function () {
    function ConsoleComponent() {
        this.open = false;
        this.logLines = [];
    }
    Object.defineProperty(ConsoleComponent.prototype, "icon", {
        get: function () {
            return this.open ? _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__["faChevronDown"] : _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__["faChevronLeft"];
        },
        enumerable: false,
        configurable: true
    });
    ConsoleComponent.prototype.ngOnChanges = function (changes) {
        this.scrollToBottom();
    };
    ConsoleComponent.prototype.ngAfterViewInit = function () {
        this.scrollToBottom();
    };
    ConsoleComponent.prototype.scrollToBottom = function () {
        if (this.logPlane != undefined) {
            this.logPlane.nativeElement.scrollTop = this.logPlane.nativeElement.scrollHeight;
        }
    };
    ConsoleComponent.prototype.toggleOpen = function () {
        this.open = !this.open;
    };
    ConsoleComponent.ɵfac = function ConsoleComponent_Factory(t) { return new (t || ConsoleComponent)(); };
    ConsoleComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ConsoleComponent, selectors: [["app-console"]], viewQuery: function ConsoleComponent_Query(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵstaticViewQuery"](_c0, true);
        } if (rf & 2) {
            var _t = void 0;
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵloadQuery"]()) && (ctx.logPlane = _t.first);
        } }, inputs: { open: "open", logLines: "logLines" }, outputs: { open: "open" }, features: [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵNgOnChangesFeature"]], decls: 9, vars: 5, consts: [[1, "consoleplane"], [1, "topbar", 3, "click"], [1, "space"], ["size", "1x", 3, "icon"], [1, "consoletext", 3, "ngClass"], ["logPlane", ""], ["class", "consoleline", 4, "ngFor", "ngForOf"], [1, "consoleline"]], template: function ConsoleComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function ConsoleComponent_Template_div_click_1_listener() { return ctx.toggleOpen(); });
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "span");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, "Console");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](4, "div", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5, "fa-icon", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 4, 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, ConsoleComponent_div_8_Template, 2, 1, "div", 6);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        } if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("icon", ctx.icon);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction1"](3, _c1, ctx.open));
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.logLines);
        } }, directives: [_fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_2__["FaIconComponent"], _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgClass"], _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgForOf"]], styles: [".consoleplane[_ngcontent-%COMP%] {\n  background: #ece7e7;\n  box-shadow: #c4c4c436 0px -5px 5px;\n}\n.consoleplane[_ngcontent-%COMP%]   .topbar[_ngcontent-%COMP%] {\n  display: flex;\n  cursor: pointer;\n  height: 30px;\n  margin: 0 8px;\n}\n.consoleplane[_ngcontent-%COMP%]   .topbar[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] {\n  line-height: 30px;\n}\n.consoleplane[_ngcontent-%COMP%]   .topbar[_ngcontent-%COMP%]    > .space[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.consoleplane[_ngcontent-%COMP%]   .topbar[_ngcontent-%COMP%]    > fa-icon[_ngcontent-%COMP%] {\n  color: #1895e3;\n  display: block;\n  margin: 7px;\n  height: 16px;\n}\n.consoleplane[_ngcontent-%COMP%]   .topbar[_ngcontent-%COMP%]    > fa-icon[_ngcontent-%COMP%]    > svg[_ngcontent-%COMP%] {\n  height: 100%;\n}\n.consoleplane[_ngcontent-%COMP%]    > .consoletext[_ngcontent-%COMP%] {\n  display: none;\n}\n.consoleplane[_ngcontent-%COMP%]    > .consoletext.open[_ngcontent-%COMP%] {\n  display: block;\n  height: 300px;\n  overflow-y: scroll;\n  background-color: #f7f5f5;\n}\n.consoleplane[_ngcontent-%COMP%]    > .consoletext[_ngcontent-%COMP%]    > .consoleline[_ngcontent-%COMP%] {\n  font-family: \"monospace\";\n  font-size: 0.9em;\n  padding: 6px 4px;\n}\n.consoleplane[_ngcontent-%COMP%]    > .consoletext[_ngcontent-%COMP%]    > .consoleline[_ngcontent-%COMP%]:nth-child(even) {\n  background-color: #e9f1f4;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2NvbnNvbGUuY29tcG9uZW50LnNjc3MiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zdHlsaW5nL2NvbG9yc2NoZW1lLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFDSSxtQkNGaUI7RURHakIsa0NBQUE7QUFESjtBQUdJO0VBQ0ksYUFBQTtFQUNBLGVBQUE7RUFDQSxZQUFBO0VBQ0EsYUFBQTtBQURSO0FBR1E7RUFDSSxpQkFBQTtBQURaO0FBSVE7RUFDSSxPQUFBO0FBRlo7QUFLUTtFQUNJLGNDWkg7RURhRyxjQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7QUFIWjtBQUtZO0VBQ0ksWUFBQTtBQUhoQjtBQVFJO0VBQ0ksYUFBQTtBQU5SO0FBT1E7RUFDSSxjQUFBO0VBQ0EsYUFBQTtFQUNBLGtCQUFBO0VBQ0EseUJDdENVO0FEaUN0QjtBQVFRO0VBQ0ksd0JBQUE7RUFDQSxnQkFBQTtFQUNBLGdCQUFBO0FBTlo7QUFPWTtFQUNJLHlCQUFBO0FBTGhCIiwiZmlsZSI6ImNvbnNvbGUuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJAaW1wb3J0IFwiLi8uLi8uLi8uLi9zdHlsaW5nL2NvbG9yc2NoZW1lLnNjc3NcIjtcblxuLmNvbnNvbGVwbGFuZSB7XG4gICAgYmFja2dyb3VuZDogJGJhY2tncm91bmQtbGlnaHRlcjtcbiAgICBib3gtc2hhZG93OiAjYzRjNGM0MzYgMHB4IC01cHggNXB4O1xuXG4gICAgLnRvcGJhciB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgaGVpZ2h0OiAzMHB4O1xuICAgICAgICBtYXJnaW46IDAgOHB4O1xuXG4gICAgICAgID4gc3BhbiB7XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMzBweDtcbiAgICAgICAgfVxuXG4gICAgICAgID4gLnNwYWNlIHtcbiAgICAgICAgICAgIGZsZXg6IDE7XG4gICAgICAgIH1cblxuICAgICAgICA+IGZhLWljb24ge1xuICAgICAgICAgICAgY29sb3I6ICRhY2NlbnQ7XG4gICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgIG1hcmdpbjogN3B4O1xuICAgICAgICAgICAgaGVpZ2h0OiAxNnB4O1xuXG4gICAgICAgICAgICA+IHN2ZyB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgPiAuY29uc29sZXRleHQge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgICAmLm9wZW4ge1xuICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICBoZWlnaHQ6IDMwMHB4O1xuICAgICAgICAgICAgb3ZlcmZsb3cteTogc2Nyb2xsO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJGJhY2tncm91bmQtbGlnaHRlc3Q7XG4gICAgICAgIH1cblxuICAgICAgICA+IC5jb25zb2xlbGluZSB7XG4gICAgICAgICAgICBmb250LWZhbWlseTogXCJtb25vc3BhY2VcIjtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC45ZW07XG4gICAgICAgICAgICBwYWRkaW5nOiA2cHggNHB4O1xuICAgICAgICAgICAgJjpudGgtY2hpbGQoZXZlbikge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IGxpZ2h0ZW4oJGFjY2VudC1saWdodCwgMjUlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iLCIkYmFja2dyb3VuZC1saWdodGVzdDogI2Y3ZjVmNTtcbiRiYWNrZ3JvdW5kLWxpZ2h0ZXI6IGRhcmtlbigkYmFja2dyb3VuZC1saWdodGVzdCwgNSUpO1xuJGJhY2tncm91bmQtbGlnaHQ6IGRhcmtlbigkYmFja2dyb3VuZC1saWdodGVzdCwgMTAlKTtcbiRiYWNrZ3JvdW5kLWRhcms6ICM3NDdjN2M7XG4kYmFja2dyb3VuZC1kYXJrZXI6ICM0NjRiNDU7XG4kYmFja2dyb3VuZC1kYXJrZXN0OiAjMjEyMjIxO1xuXG4kdGV4dDogIzExMTExMTtcbiR0ZXh0LWxpZ2h0OiAjZjdmNWY1O1xuJGFjY2VudDogIzE4OTVlMztcbiRhY2NlbnQtbGlnaHQ6ICM5M2JkY2E7XG5cbiRmb250LWZhbWlseTogXCJIZWx2ZXRpY2FcIiwgc2Fucy1zZXJpZjsiXX0= */"], changeDetection: 0 });
    return ConsoleComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ConsoleComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-console',
                templateUrl: './console.component.html',
                styleUrls: ['./console.component.scss'],
                changeDetection: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectionStrategy"].OnPush
            }]
    }], null, { open: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }, {
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"]
        }], logLines: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }], logPlane: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"],
            args: ['logPlane', { static: true }]
        }] }); })();


/***/ }),

/***/ "Kjro":
/*!**************************************************************!*\
  !*** ./src/app/connections/servicebus-connection.effects.ts ***!
  \**************************************************************/
/*! exports provided: ServicebusConnectionEffects */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ServicebusConnectionEffects", function() { return ServicebusConnectionEffects; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngrx/effects */ "9jGm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ngrx/connections.actions */ "4QyE");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _ngrx_connections_selectors__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ngrx/connections.selectors */ "Spk+");
/* harmony import */ var _servicebus_connection_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./servicebus-connection.service */ "MXiN");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ngrx/store */ "l7P3");











var ServicebusConnectionEffects = /** @class */ (function () {
    function ServicebusConnectionEffects(actions$, servicebusConnection, store) {
        var _this = this;
        this.actions$ = actions$;
        this.servicebusConnection = servicebusConnection;
        this.store = store;
        this.testConnections$ = Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_2__["createEffect"])(function () {
            return _this.actions$.pipe(
            // listen for the type of testConnection
            Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_2__["ofType"])(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_4__["testConnection"]), 
            // retreive the currently selected connection
            Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["withLatestFrom"])(_this.store.select(_ngrx_connections_selectors__WEBPACK_IMPORTED_MODULE_6__["getSelectedConnection"])), 
            // execute the test and return the result
            Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["mergeMap"])(function (_a) {
                var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_a, 2), action = _b[0], connection = _b[1];
                if (connection === null) {
                    return Object(rxjs__WEBPACK_IMPORTED_MODULE_5__["of"])(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_4__["testConnectionFailed"]({ error: 'selectedConnection is empty' }));
                }
                return _this.servicebusConnection.testConnection(connection)
                    .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])(function () { return _ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_4__["testConnectionSuccess"](); }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])(function (error) { return Object(rxjs__WEBPACK_IMPORTED_MODULE_5__["of"])(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_4__["testConnectionFailed"]({ error: error })); }));
            }));
        });
    }
    ServicebusConnectionEffects.ɵfac = function ServicebusConnectionEffects_Factory(t) { return new (t || ServicebusConnectionEffects)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_ngrx_effects__WEBPACK_IMPORTED_MODULE_2__["Actions"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_servicebus_connection_service__WEBPACK_IMPORTED_MODULE_7__["ServicebusConnectionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_ngrx_store__WEBPACK_IMPORTED_MODULE_8__["Store"])); };
    ServicebusConnectionEffects.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: ServicebusConnectionEffects, factory: ServicebusConnectionEffects.ɵfac });
    return ServicebusConnectionEffects;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](ServicebusConnectionEffects, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"]
    }], function () { return [{ type: _ngrx_effects__WEBPACK_IMPORTED_MODULE_2__["Actions"] }, { type: _servicebus_connection_service__WEBPACK_IMPORTED_MODULE_7__["ServicebusConnectionService"] }, { type: _ngrx_store__WEBPACK_IMPORTED_MODULE_8__["Store"] }]; }, null); })();


/***/ }),

/***/ "KwNA":
/*!*****************************************************!*\
  !*** ./src/app/ui/menu-item/menu-item.component.ts ***!
  \*****************************************************/
/*! exports provided: MenuItemComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MenuItemComponent", function() { return MenuItemComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");



var _c0 = function (a0) { return { "show": a0 }; };
var _c1 = ["*"];
var MenuItemComponent = /** @class */ (function () {
    function MenuItemComponent() {
        this.showSubmenu = false;
        this.name = "";
    }
    MenuItemComponent.prototype.clickout = function (event) {
        this.showSubmenu = false;
    };
    MenuItemComponent.prototype.toggleShowSubMenu = function ($event) {
        this.showSubmenu = !this.showSubmenu;
        $event.stopPropagation();
    };
    MenuItemComponent.ɵfac = function MenuItemComponent_Factory(t) { return new (t || MenuItemComponent)(); };
    MenuItemComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: MenuItemComponent, selectors: [["app-menu-item"]], hostBindings: function MenuItemComponent_HostBindings(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function MenuItemComponent_click_HostBindingHandler($event) { return ctx.clickout($event); }, false, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵresolveDocument"]);
        } }, inputs: { showSubmenu: "showSubmenu", name: "name" }, outputs: { showSubmenu: "showSubmenu" }, ngContentSelectors: _c1, decls: 5, vars: 4, consts: [[1, "menu-item", 3, "click"], [1, "sub-menu", 3, "ngClass"]], template: function MenuItemComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function MenuItemComponent_Template_div_click_0_listener($event) { return ctx.toggleShowSubMenu($event); });
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "span");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojection"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        } if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.name);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction1"](2, _c0, ctx.showSubmenu));
        } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["NgClass"]], styles: ["[_nghost-%COMP%] {\n  display: inline-block;\n}\n\n.menu-item[_ngcontent-%COMP%] {\n  color: #f7f5f5;\n  line-height: 30px;\n  padding: 0 12px;\n  cursor: pointer;\n}\n\n.menu-item[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] {\n  color: #e0d9d9;\n}\n\n.menu-item[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%]:hover {\n  color: #f7f5f5;\n}\n\n.sub-menu[_ngcontent-%COMP%] {\n  display: none;\n}\n\n.sub-menu.show[_ngcontent-%COMP%] {\n  display: block;\n  position: absolute;\n  z-index: 1;\n  width: 200px;\n  background: #464b45;\n  color: #f7f5f5;\n}\n\n.sub-menu.show[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL21lbnUtaXRlbS5jb21wb25lbnQuc2NzcyIsIi4uLy4uLy4uLy4uLy4uL21lbnVDb25maWcuc2NzcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N0eWxpbmcvY29sb3JzY2hlbWUuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQTtFQUNJLHFCQUFBO0FBRko7O0FBS0E7RUFDSSxjQUFBO0VBQ0EsaUJDVFU7RURVVixlQUFBO0VBQ0EsZUFBQTtBQUZKOztBQUlJO0VBQ0ksY0FBQTtBQUZSOztBQUlRO0VBQ0ksY0VUQztBRk9iOztBQU9BO0VBQ0ksYUFBQTtBQUpKOztBQUtJO0VBQ0ksY0FBQTtFQUNBLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLFlDMUJRO0VEMkJSLG1CRXpCWTtFRjBCWixjRXRCSztBRm1CYjs7QUFLUTtFQUNJLGNBQUE7RUFDQSxXQUFBO0FBSFoiLCJmaWxlIjoibWVudS1pdGVtLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiQGltcG9ydCBcIi4vLi4vLi4vLi4vc3R5bGluZy9jb2xvcnNjaGVtZS5zY3NzXCI7XG5AaW1wb3J0IFwiLi8uLi9tZW51Q29uZmlnLnNjc3NcIjtcblxuOmhvc3Qge1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbn1cblxuLm1lbnUtaXRlbSB7XG4gICAgY29sb3I6ICR0ZXh0LWxpZ2h0O1xuICAgIGxpbmUtaGVpZ2h0OiAkbWVudS1oZWlnaHQ7XG4gICAgcGFkZGluZzogMCAkbWVudS1zcGFjaW5nO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcblxuICAgID4gc3BhbiB7XG4gICAgICAgIGNvbG9yOiBkYXJrZW4oJHRleHQtbGlnaHQsIDEwJSk7XG5cbiAgICAgICAgJjpob3ZlciB7XG4gICAgICAgICAgICBjb2xvcjogJHRleHQtbGlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi5zdWItbWVudSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgICAmLnNob3cge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICB3aWR0aDogJHN1Ym1lbnUtd2lkdGg7XG4gICAgICAgIGJhY2tncm91bmQ6ICRiYWNrZ3JvdW5kLWRhcmtlcjtcbiAgICAgICAgY29sb3I6ICR0ZXh0LWxpZ2h0O1xuXG4gICAgICAgID4gKiB7XG4gICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICB9XG4gICAgfVxufSIsIiRtZW51LWhlaWdodDogMzBweDtcbiRtZW51LXNwYWNpbmc6IDEycHg7XG4kc3VibWVudS13aWR0aDogMjAwcHg7IiwiJGJhY2tncm91bmQtbGlnaHRlc3Q6ICNmN2Y1ZjU7XG4kYmFja2dyb3VuZC1saWdodGVyOiBkYXJrZW4oJGJhY2tncm91bmQtbGlnaHRlc3QsIDUlKTtcbiRiYWNrZ3JvdW5kLWxpZ2h0OiBkYXJrZW4oJGJhY2tncm91bmQtbGlnaHRlc3QsIDEwJSk7XG4kYmFja2dyb3VuZC1kYXJrOiAjNzQ3YzdjO1xuJGJhY2tncm91bmQtZGFya2VyOiAjNDY0YjQ1O1xuJGJhY2tncm91bmQtZGFya2VzdDogIzIxMjIyMTtcblxuJHRleHQ6ICMxMTExMTE7XG4kdGV4dC1saWdodDogI2Y3ZjVmNTtcbiRhY2NlbnQ6ICMxODk1ZTM7XG4kYWNjZW50LWxpZ2h0OiAjOTNiZGNhO1xuXG4kZm9udC1mYW1pbHk6IFwiSGVsdmV0aWNhXCIsIHNhbnMtc2VyaWY7Il19 */"], changeDetection: 0 });
    return MenuItemComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](MenuItemComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-menu-item',
                templateUrl: './menu-item.component.html',
                styleUrls: ['./menu-item.component.scss'],
                changeDetection: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectionStrategy"].OnPush
            }]
    }], function () { return []; }, { showSubmenu: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }, {
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"]
        }], name: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }], clickout: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["HostListener"],
            args: ['document:click', ['$event']]
        }] }); })();


/***/ }),

/***/ "MUyc":
/*!***************************************************!*\
  !*** ./src/app/connections/connections.module.ts ***!
  \***************************************************/
/*! exports provided: ConnectionsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConnectionsModule", function() { return ConnectionsModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _connections_routing_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./connections-routing.module */ "F4tb");
/* harmony import */ var _edit_edit_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./edit/edit.component */ "Ibxp");
/* harmony import */ var _connection_plane_connection_plane_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./connection-plane/connection-plane.component */ "ARvF");
/* harmony import */ var _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @fortawesome/angular-fontawesome */ "6NWb");
/* harmony import */ var _connection_plane_item_connection_plane_item_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./connection-plane-item/connection-plane-item.component */ "N6MK");
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ngrx/effects */ "9jGm");
/* harmony import */ var _servicebus_connection_effects__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./servicebus-connection.effects */ "Kjro");
/* harmony import */ var _ngrx_connections_reducers__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ngrx/connections.reducers */ "9ezh");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ngrx/store */ "l7P3");














var ConnectionsModule = /** @class */ (function () {
    function ConnectionsModule() {
    }
    ConnectionsModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: ConnectionsModule });
    ConnectionsModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function ConnectionsModule_Factory(t) { return new (t || ConnectionsModule)(); }, imports: [[
                _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                _connections_routing_module__WEBPACK_IMPORTED_MODULE_2__["ConnectionsRoutingModule"],
                _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_5__["FontAwesomeModule"],
                _ngrx_store__WEBPACK_IMPORTED_MODULE_10__["StoreModule"].forFeature('connections', _ngrx_connections_reducers__WEBPACK_IMPORTED_MODULE_9__["connectionReducer"]),
                _ngrx_effects__WEBPACK_IMPORTED_MODULE_7__["EffectsModule"].forFeature([_servicebus_connection_effects__WEBPACK_IMPORTED_MODULE_8__["ServicebusConnectionEffects"]])
            ]] });
    return ConnectionsModule;
}());

(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](ConnectionsModule, { declarations: [_edit_edit_component__WEBPACK_IMPORTED_MODULE_3__["EditComponent"],
        _connection_plane_connection_plane_component__WEBPACK_IMPORTED_MODULE_4__["ConnectionPlaneComponent"],
        _connection_plane_item_connection_plane_item_component__WEBPACK_IMPORTED_MODULE_6__["ConnectionPlaneItemComponent"]], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
        _connections_routing_module__WEBPACK_IMPORTED_MODULE_2__["ConnectionsRoutingModule"],
        _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_5__["FontAwesomeModule"], _ngrx_store__WEBPACK_IMPORTED_MODULE_10__["StoreFeatureModule"], _ngrx_effects__WEBPACK_IMPORTED_MODULE_7__["EffectsFeatureModule"]], exports: [_connection_plane_connection_plane_component__WEBPACK_IMPORTED_MODULE_4__["ConnectionPlaneComponent"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ConnectionsModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [
                    _edit_edit_component__WEBPACK_IMPORTED_MODULE_3__["EditComponent"],
                    _connection_plane_connection_plane_component__WEBPACK_IMPORTED_MODULE_4__["ConnectionPlaneComponent"],
                    _connection_plane_item_connection_plane_item_component__WEBPACK_IMPORTED_MODULE_6__["ConnectionPlaneItemComponent"]
                ],
                imports: [
                    _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                    _connections_routing_module__WEBPACK_IMPORTED_MODULE_2__["ConnectionsRoutingModule"],
                    _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_5__["FontAwesomeModule"],
                    _ngrx_store__WEBPACK_IMPORTED_MODULE_10__["StoreModule"].forFeature('connections', _ngrx_connections_reducers__WEBPACK_IMPORTED_MODULE_9__["connectionReducer"]),
                    _ngrx_effects__WEBPACK_IMPORTED_MODULE_7__["EffectsModule"].forFeature([_servicebus_connection_effects__WEBPACK_IMPORTED_MODULE_8__["ServicebusConnectionEffects"]])
                ],
                exports: [
                    _connection_plane_connection_plane_component__WEBPACK_IMPORTED_MODULE_4__["ConnectionPlaneComponent"]
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "MXiN":
/*!**************************************************************!*\
  !*** ./src/app/connections/servicebus-connection.service.ts ***!
  \**************************************************************/
/*! exports provided: ServicebusConnectionService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ServicebusConnectionService", function() { return ServicebusConnectionService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _ngrx_connections_models__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ngrx/connections.models */ "hHq3");
/* harmony import */ var _azure_service_bus__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @azure/service-bus */ "u/ff");





var ServicebusConnectionService = /** @class */ (function () {
    function ServicebusConnectionService() {
    }
    ServicebusConnectionService.prototype.testConnection = function (connection) {
        try {
            var client = this.initClient(connection);
            //client.close();
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["of"])(connection);
        }
        catch (e) {
            if (e.constructor.name === 'Error') {
                var error = e;
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["throwError"])(error.message);
            }
            else {
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["throwError"])('test failed because of unknown reason');
            }
        }
    };
    ServicebusConnectionService.prototype.initClient = function (connection) {
        switch (connection.connectionType) {
            case _ngrx_connections_models__WEBPACK_IMPORTED_MODULE_2__["ConnectionType"].connectionString:
                var connectionDetails = connection.connectionDetails;
                return new _azure_service_bus__WEBPACK_IMPORTED_MODULE_3__["ServiceBusClient"](connectionDetails.connetionString);
            default:
                throw new Error("Connection type not supported yet, cannot create client");
        }
    };
    ServicebusConnectionService.ɵfac = function ServicebusConnectionService_Factory(t) { return new (t || ServicebusConnectionService)(); };
    ServicebusConnectionService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: ServicebusConnectionService, factory: ServicebusConnectionService.ɵfac, providedIn: 'root' });
    return ServicebusConnectionService;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ServicebusConnectionService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "N6MK":
/*!**************************************************************************************!*\
  !*** ./src/app/connections/connection-plane-item/connection-plane-item.component.ts ***!
  \**************************************************************************************/
/*! exports provided: ConnectionPlaneItemComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConnectionPlaneItemComponent", function() { return ConnectionPlaneItemComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "wHSu");
/* harmony import */ var _ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ngrx/connections.actions */ "4QyE");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngrx/store */ "l7P3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @fortawesome/angular-fontawesome */ "6NWb");







var ConnectionPlaneItemComponent = /** @class */ (function () {
    function ConnectionPlaneItemComponent(store, router) {
        this.store = store;
        this.router = router;
        this.faEdit = _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_1__["faEdit"];
    }
    ConnectionPlaneItemComponent.prototype.edit = function (connection) {
        if (connection === undefined) {
            return;
        }
        this.store.dispatch(Object(_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_2__["selectConnection"])({
            id: connection.id
        }));
        this.router.navigate(['connections', 'edit']);
    };
    ConnectionPlaneItemComponent.ɵfac = function ConnectionPlaneItemComponent_Factory(t) { return new (t || ConnectionPlaneItemComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngrx_store__WEBPACK_IMPORTED_MODULE_3__["Store"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"])); };
    ConnectionPlaneItemComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ConnectionPlaneItemComponent, selectors: [["app-connection-plane-item"]], inputs: { connection: "connection" }, decls: 7, vars: 2, consts: [[1, "connection"], [1, "title"], [1, "space"], [3, "click"], [3, "icon"]], template: function ConnectionPlaneItemComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "span");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](4, "div", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "a", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function ConnectionPlaneItemComponent_Template_a_click_5_listener() { return ctx.edit(ctx.connection); });
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](6, "fa-icon", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        } if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.connection == null ? null : ctx.connection.name);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("icon", ctx.faEdit);
        } }, directives: [_fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_5__["FaIconComponent"]], styles: [".title[_ngcontent-%COMP%] {\n  display: flex;\n}\n.title[_ngcontent-%COMP%]   .space[_ngcontent-%COMP%] {\n  flex: 1;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2Nvbm5lY3Rpb24tcGxhbmUtaXRlbS5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGFBQUE7QUFDSjtBQUFJO0VBQ0ksT0FBQTtBQUVSIiwiZmlsZSI6ImNvbm5lY3Rpb24tcGxhbmUtaXRlbS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi50aXRsZSB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICAuc3BhY2Uge1xuICAgICAgICBmbGV4OiAxO1xuICAgIH1cbn0iXX0= */"] });
    return ConnectionPlaneItemComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ConnectionPlaneItemComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-connection-plane-item',
                templateUrl: './connection-plane-item.component.html',
                styleUrls: ['./connection-plane-item.component.scss']
            }]
    }], function () { return [{ type: _ngrx_store__WEBPACK_IMPORTED_MODULE_3__["Store"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"] }]; }, { connection: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }] }); })();


/***/ }),

/***/ "N6Oy":
/*!***********************************************************!*\
  !*** ./src/app/ui/submenu-item/submenu-item.component.ts ***!
  \***********************************************************/
/*! exports provided: SubmenuItemComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SubmenuItemComponent", function() { return SubmenuItemComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


var SubmenuItemComponent = /** @class */ (function () {
    function SubmenuItemComponent() {
        this.name = "";
    }
    SubmenuItemComponent.ɵfac = function SubmenuItemComponent_Factory(t) { return new (t || SubmenuItemComponent)(); };
    SubmenuItemComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SubmenuItemComponent, selectors: [["app-submenu-item"]], inputs: { name: "name" }, decls: 2, vars: 1, consts: [[1, "submenu-item"]], template: function SubmenuItemComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "span", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        } if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.name);
        } }, styles: [".submenu-item[_ngcontent-%COMP%] {\n  padding: 0 12px;\n  line-height: 30px;\n  color: #e0d9d9;\n  cursor: pointer;\n}\n.submenu-item[_ngcontent-%COMP%]:hover {\n  color: #f7f5f5;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3N1Ym1lbnUtaXRlbS5jb21wb25lbnQuc2NzcyIsIi4uLy4uLy4uLy4uLy4uL21lbnVDb25maWcuc2NzcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N0eWxpbmcvY29sb3JzY2hlbWUuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQTtFQUNJLGVBQUE7RUFDQSxpQkNMVTtFRE1WLGNBQUE7RUFDQSxlQUFBO0FBRko7QUFJSTtFQUNJLGNFRks7QUZBYiIsImZpbGUiOiJzdWJtZW51LWl0ZW0uY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJAaW1wb3J0IFwiLi8uLi8uLi8uLi9zdHlsaW5nL2NvbG9yc2NoZW1lLnNjc3NcIjtcbkBpbXBvcnQgXCIuLy4uL21lbnVDb25maWcuc2Nzc1wiO1xuXG4uc3VibWVudS1pdGVtIHtcbiAgICBwYWRkaW5nOiAwICRtZW51LXNwYWNpbmc7XG4gICAgbGluZS1oZWlnaHQ6ICRtZW51LWhlaWdodDtcbiAgICBjb2xvcjogZGFya2VuKCR0ZXh0LWxpZ2h0LCAxMCUpO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcblxuICAgICY6aG92ZXIge1xuICAgICAgICBjb2xvcjogJHRleHQtbGlnaHQ7XG4gICAgfSBcbn0iLCIkbWVudS1oZWlnaHQ6IDMwcHg7XG4kbWVudS1zcGFjaW5nOiAxMnB4O1xuJHN1Ym1lbnUtd2lkdGg6IDIwMHB4OyIsIiRiYWNrZ3JvdW5kLWxpZ2h0ZXN0OiAjZjdmNWY1O1xuJGJhY2tncm91bmQtbGlnaHRlcjogZGFya2VuKCRiYWNrZ3JvdW5kLWxpZ2h0ZXN0LCA1JSk7XG4kYmFja2dyb3VuZC1saWdodDogZGFya2VuKCRiYWNrZ3JvdW5kLWxpZ2h0ZXN0LCAxMCUpO1xuJGJhY2tncm91bmQtZGFyazogIzc0N2M3YztcbiRiYWNrZ3JvdW5kLWRhcmtlcjogIzQ2NGI0NTtcbiRiYWNrZ3JvdW5kLWRhcmtlc3Q6ICMyMTIyMjE7XG5cbiR0ZXh0OiAjMTExMTExO1xuJHRleHQtbGlnaHQ6ICNmN2Y1ZjU7XG4kYWNjZW50OiAjMTg5NWUzO1xuJGFjY2VudC1saWdodDogIzkzYmRjYTtcblxuJGZvbnQtZmFtaWx5OiBcIkhlbHZldGljYVwiLCBzYW5zLXNlcmlmOyJdfQ== */"], changeDetection: 0 });
    return SubmenuItemComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SubmenuItemComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-submenu-item',
                templateUrl: './submenu-item.component.html',
                styleUrls: ['./submenu-item.component.scss'],
                changeDetection: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectionStrategy"].OnPush
            }]
    }], null, { name: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }] }); })();


/***/ }),

/***/ "Spk+":
/*!***********************************************************!*\
  !*** ./src/app/connections/ngrx/connections.selectors.ts ***!
  \***********************************************************/
/*! exports provided: getConnections, getSelectedConnection */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getConnections", function() { return getConnections; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSelectedConnection", function() { return getSelectedConnection; });
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ngrx/store */ "l7P3");

var getConnectionsFeatureState = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createFeatureSelector"])('connections');
var getConnections = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getConnectionsFeatureState, function (state) { return state.connections; });
var getSelectedConnection = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getConnectionsFeatureState, function (state) { return state.selectedConnection; });


/***/ }),

/***/ "Sy1n":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _connections_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connections/ngrx/connections.actions */ "4QyE");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngrx/store */ "l7P3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _ui_menubar_menubar_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ui/menubar/menubar.component */ "8l7x");
/* harmony import */ var _ui_menu_item_menu_item_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ui/menu-item/menu-item.component */ "KwNA");
/* harmony import */ var _ui_submenu_item_submenu_item_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ui/submenu-item/submenu-item.component */ "N6Oy");
/* harmony import */ var _ui_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ui/sidebar/sidebar.component */ "BGbG");
/* harmony import */ var _connections_connection_plane_connection_plane_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./connections/connection-plane/connection-plane.component */ "ARvF");
/* harmony import */ var _ui_console_console_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ui/console/console.component */ "J65a");











var AppComponent = /** @class */ (function () {
    function AppComponent(store, router) {
        this.store = store;
        this.router = router;
        this.title = 'Servicebus Browser';
        this.logs = [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
            'tempor incididunt ut labore et dolore magna aliqua. Phasellus faucibus',
            'scelerisque eleifend donec pretium vulputate sapien nec sagittis. Feugiat',
            'nibh sed pulvinar proin. Ac ut consequat semper viverra nam libero justo',
            'laoreet. Risus sed vulputate odio ut enim blandit. Auctor elit sed vulputate',
            'mi sit amet. Lorem donec massa sapien faucibus et. Velit euismod in',
            'pellentesque massa placerat duis ultricies. Massa vitae tortor',
            'condimentum lacinia quis vel. Auctor neque vitae tempus quam',
            'pellentesque nec. In aliquam sem fringilla ut morbi tincidunt augue',
            'interdum velit. Elit ullamcorper dignissim cras tincidunt. Feugiat in',
            'fermentum posuere urna nec tincidunt praesent. Nulla aliquet porttitor',
            'lacus luctus accumsan. Id diam vel quam elementum pulvinar etiam non',
            'quam lacus. Quis viverra nibh cras pulvinar mattis nunc.',
            'Tempor id eu nisl nunc mi ipsum faucibus vitae. Blandit cursus risus at',
            'ultrices. Consequat id porta nibh venenatis cras. Vel quam elementum',
            'pulvinar etiam. Quam quisque id diam vel quam elementum. Quis enim',
            'lobortis scelerisque fermentum dui faucibus in ornare. At lectus urna duis',
            'convallis convallis tellus id interdum velit. Lectus mauris ultrices eros in',
        ];
    }
    AppComponent.prototype.connectPressed = function () {
        this.store.dispatch(Object(_connections_ngrx_connections_actions__WEBPACK_IMPORTED_MODULE_1__["createConnection"])());
        this.router.navigate(["connections", "edit"]);
    };
    AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngrx_store__WEBPACK_IMPORTED_MODULE_2__["Store"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"])); };
    AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 10, vars: 1, consts: [["name", "Config"], ["name", "Connect", 3, "click"], [1, "body"], [1, "wrapper"], [1, "view"], [3, "logLines"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "app-menubar");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "app-menu-item", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "app-submenu-item", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AppComponent_Template_app_submenu_item_click_2_listener() { return ctx.connectPressed(); });
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "app-sidebar");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5, "app-connection-plane");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "div", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](8, "router-outlet");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](9, "app-console", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        } if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](9);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("logLines", ctx.logs);
        } }, directives: [_ui_menubar_menubar_component__WEBPACK_IMPORTED_MODULE_4__["MenubarComponent"], _ui_menu_item_menu_item_component__WEBPACK_IMPORTED_MODULE_5__["MenuItemComponent"], _ui_submenu_item_submenu_item_component__WEBPACK_IMPORTED_MODULE_6__["SubmenuItemComponent"], _ui_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_7__["SidebarComponent"], _connections_connection_plane_connection_plane_component__WEBPACK_IMPORTED_MODULE_8__["ConnectionPlaneComponent"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterOutlet"], _ui_console_console_component__WEBPACK_IMPORTED_MODULE_9__["ConsoleComponent"]], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  width: 100vw;\n}\n\n.body[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n}\n\napp-sidebar[_ngcontent-%COMP%] {\n  display: block;\n  height: 100%;\n}\n\n.wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n}\n\n.view[_ngcontent-%COMP%] {\n  display: block;\n  flex: 1;\n  overflow: auto;\n  height: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGFBQUE7RUFDQSxzQkFBQTtFQUNBLGFBQUE7RUFDQSxZQUFBO0FBQ0o7O0FBRUE7RUFDSSxhQUFBO0VBQ0EsT0FBQTtBQUNKOztBQUVBO0VBQ0ksY0FBQTtFQUNBLFlBQUE7QUFDSjs7QUFFQTtFQUNJLGFBQUE7RUFDQSxzQkFBQTtFQUNBLE9BQUE7QUFDSjs7QUFFQTtFQUNJLGNBQUE7RUFDQSxPQUFBO0VBQ0EsY0FBQTtFQUNBLFlBQUE7QUFDSiIsImZpbGUiOiJhcHAuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyI6aG9zdCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGhlaWdodDogMTAwdmg7XG4gICAgd2lkdGg6IDEwMHZ3O1xufVxuXG4uYm9keSB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4OiAxO1xufVxuXG5hcHAtc2lkZWJhciB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgaGVpZ2h0OiAxMDAlO1xufVxuXG4ud3JhcHBlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGZsZXg6IDE7XG59XG5cbi52aWV3IHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBmbGV4OiAxO1xuICAgIG92ZXJmbG93OiBhdXRvO1xuICAgIGhlaWdodDogMTAwJTtcbn0iXX0= */"] });
    return AppComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-root',
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.scss']
            }]
    }], function () { return [{ type: _ngrx_store__WEBPACK_IMPORTED_MODULE_2__["Store"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"] }]; }, null); })();


/***/ }),

/***/ "ZAI4":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-routing.module */ "vY5A");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app.component */ "Sy1n");
/* harmony import */ var _angular_service_worker__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/service-worker */ "Jho9");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../environments/environment */ "AytR");
/* harmony import */ var _ui_ui_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ui/ui.module */ "oRDy");
/* harmony import */ var _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @fortawesome/angular-fontawesome */ "6NWb");
/* harmony import */ var _main_main_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./main/main.component */ "wlho");
/* harmony import */ var _ngrx_module__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ngrx.module */ "7+jg");
/* harmony import */ var _connections_connections_module__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./connections/connections.module */ "MUyc");
/* harmony import */ var _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ngrx/store-devtools */ "agSv");
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ngrx/effects */ "9jGm");
/* harmony import */ var _ngrx_router_store__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @ngrx/router-store */ "99NH");



















var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]] });
    AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ factory: function AppModule_Factory(t) { return new (t || AppModule)(); }, providers: [], imports: [[
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"],
                _ngrx_module__WEBPACK_IMPORTED_MODULE_9__["NgrxModule"],
                _angular_service_worker__WEBPACK_IMPORTED_MODULE_4__["ServiceWorkerModule"].register('ngsw-worker.js', { enabled: _environments_environment__WEBPACK_IMPORTED_MODULE_5__["environment"].production }),
                _ui_ui_module__WEBPACK_IMPORTED_MODULE_6__["UiModule"],
                _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__["FontAwesomeModule"],
                _connections_connections_module__WEBPACK_IMPORTED_MODULE_10__["ConnectionsModule"],
                _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__["StoreDevtoolsModule"].instrument({ name: "Servicebus Browser", maxAge: 25, logOnly: _environments_environment__WEBPACK_IMPORTED_MODULE_5__["environment"].production }),
                _ngrx_effects__WEBPACK_IMPORTED_MODULE_12__["EffectsModule"].forRoot([]),
                _ngrx_router_store__WEBPACK_IMPORTED_MODULE_13__["StoreRouterConnectingModule"].forRoot()
            ]] });
    return AppModule;
}());

(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"],
        _main_main_component__WEBPACK_IMPORTED_MODULE_8__["MainComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"],
        _ngrx_module__WEBPACK_IMPORTED_MODULE_9__["NgrxModule"], _angular_service_worker__WEBPACK_IMPORTED_MODULE_4__["ServiceWorkerModule"], _ui_ui_module__WEBPACK_IMPORTED_MODULE_6__["UiModule"],
        _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__["FontAwesomeModule"],
        _connections_connections_module__WEBPACK_IMPORTED_MODULE_10__["ConnectionsModule"], _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__["StoreDevtoolsModule"], _ngrx_effects__WEBPACK_IMPORTED_MODULE_12__["EffectsRootModule"], _ngrx_router_store__WEBPACK_IMPORTED_MODULE_13__["StoreRouterConnectingModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AppModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"],
        args: [{
                declarations: [
                    _app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"],
                    _main_main_component__WEBPACK_IMPORTED_MODULE_8__["MainComponent"]
                ],
                imports: [
                    _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                    _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"],
                    _ngrx_module__WEBPACK_IMPORTED_MODULE_9__["NgrxModule"],
                    _angular_service_worker__WEBPACK_IMPORTED_MODULE_4__["ServiceWorkerModule"].register('ngsw-worker.js', { enabled: _environments_environment__WEBPACK_IMPORTED_MODULE_5__["environment"].production }),
                    _ui_ui_module__WEBPACK_IMPORTED_MODULE_6__["UiModule"],
                    _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__["FontAwesomeModule"],
                    _connections_connections_module__WEBPACK_IMPORTED_MODULE_10__["ConnectionsModule"],
                    _ngrx_store_devtools__WEBPACK_IMPORTED_MODULE_11__["StoreDevtoolsModule"].instrument({ name: "Servicebus Browser", maxAge: 25, logOnly: _environments_environment__WEBPACK_IMPORTED_MODULE_5__["environment"].production }),
                    _ngrx_effects__WEBPACK_IMPORTED_MODULE_12__["EffectsModule"].forRoot([]),
                    _ngrx_router_store__WEBPACK_IMPORTED_MODULE_13__["StoreRouterConnectingModule"].forRoot()
                ],
                providers: [],
                bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "hHq3":
/*!********************************************************!*\
  !*** ./src/app/connections/ngrx/connections.models.ts ***!
  \********************************************************/
/*! exports provided: ConnectionType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConnectionType", function() { return ConnectionType; });
var ConnectionType;
(function (ConnectionType) {
    ConnectionType[ConnectionType["connectionString"] = 0] = "connectionString";
    ConnectionType[ConnectionType["AADTokenCredentials"] = 1] = "AADTokenCredentials";
})(ConnectionType || (ConnectionType = {}));


/***/ }),

/***/ "oRDy":
/*!*********************************!*\
  !*** ./src/app/ui/ui.module.ts ***!
  \*********************************/
/*! exports provided: UiModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UiModule", function() { return UiModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _menubar_menubar_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./menubar/menubar.component */ "8l7x");
/* harmony import */ var _menu_item_menu_item_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./menu-item/menu-item.component */ "KwNA");
/* harmony import */ var _submenu_item_submenu_item_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./submenu-item/submenu-item.component */ "N6Oy");
/* harmony import */ var _sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./sidebar/sidebar.component */ "BGbG");
/* harmony import */ var _console_console_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./console/console.component */ "J65a");
/* harmony import */ var _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @fortawesome/angular-fontawesome */ "6NWb");









var UiModule = /** @class */ (function () {
    function UiModule() {
    }
    UiModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: UiModule });
    UiModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function UiModule_Factory(t) { return new (t || UiModule)(); }, imports: [[
                _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__["FontAwesomeModule"]
            ]] });
    return UiModule;
}());

(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](UiModule, { declarations: [_menubar_menubar_component__WEBPACK_IMPORTED_MODULE_2__["MenubarComponent"],
        _menu_item_menu_item_component__WEBPACK_IMPORTED_MODULE_3__["MenuItemComponent"],
        _submenu_item_submenu_item_component__WEBPACK_IMPORTED_MODULE_4__["SubmenuItemComponent"],
        _sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_5__["SidebarComponent"],
        _console_console_component__WEBPACK_IMPORTED_MODULE_6__["ConsoleComponent"]], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
        _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__["FontAwesomeModule"]], exports: [_menubar_menubar_component__WEBPACK_IMPORTED_MODULE_2__["MenubarComponent"],
        _menu_item_menu_item_component__WEBPACK_IMPORTED_MODULE_3__["MenuItemComponent"],
        _submenu_item_submenu_item_component__WEBPACK_IMPORTED_MODULE_4__["SubmenuItemComponent"],
        _sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_5__["SidebarComponent"],
        _console_console_component__WEBPACK_IMPORTED_MODULE_6__["ConsoleComponent"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](UiModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [
                    _menubar_menubar_component__WEBPACK_IMPORTED_MODULE_2__["MenubarComponent"],
                    _menu_item_menu_item_component__WEBPACK_IMPORTED_MODULE_3__["MenuItemComponent"],
                    _submenu_item_submenu_item_component__WEBPACK_IMPORTED_MODULE_4__["SubmenuItemComponent"],
                    _sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_5__["SidebarComponent"],
                    _console_console_component__WEBPACK_IMPORTED_MODULE_6__["ConsoleComponent"]
                ],
                imports: [
                    _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                    _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__["FontAwesomeModule"]
                ],
                exports: [
                    _menubar_menubar_component__WEBPACK_IMPORTED_MODULE_2__["MenubarComponent"],
                    _menu_item_menu_item_component__WEBPACK_IMPORTED_MODULE_3__["MenuItemComponent"],
                    _submenu_item_submenu_item_component__WEBPACK_IMPORTED_MODULE_4__["SubmenuItemComponent"],
                    _sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_5__["SidebarComponent"],
                    _console_console_component__WEBPACK_IMPORTED_MODULE_6__["ConsoleComponent"],
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "vY5A":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _main_main_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./main/main.component */ "wlho");





var routes = [
    {
        path: "",
        component: _main_main_component__WEBPACK_IMPORTED_MODULE_2__["MainComponent"]
    },
    {
        path: "connections",
        loadChildren: function () { return Promise.resolve(/*! import() */).then(__webpack_require__.bind(null, /*! ./connections/connections-routing.module */ "F4tb")).then(function (m) { return m.ConnectionsRoutingModule; }); }
    }
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
    AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] });
    return AppRoutingModule;
}());

(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes)],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "wlho":
/*!****************************************!*\
  !*** ./src/app/main/main.component.ts ***!
  \****************************************/
/*! exports provided: MainComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MainComponent", function() { return MainComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


var MainComponent = /** @class */ (function () {
    function MainComponent() {
    }
    MainComponent.prototype.ngOnInit = function () {
    };
    MainComponent.ɵfac = function MainComponent_Factory(t) { return new (t || MainComponent)(); };
    MainComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: MainComponent, selectors: [["ng-component"]], decls: 2, vars: 0, template: function MainComponent_Template(rf, ctx) { if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "main works!");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJtYWluLmNvbXBvbmVudC5zY3NzIn0= */"] });
    return MainComponent;
}());

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](MainComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                templateUrl: './main.component.html',
                styleUrls: ['./main.component.scss']
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "zUnb":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./environments/environment */ "AytR");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "ZAI4");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ "zn8P":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "zn8P";

/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map