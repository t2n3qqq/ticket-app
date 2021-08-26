import { Platform } from 'react-native';
import _ from 'lodash';
// import moment from 'moment';
import config from 'react-native-config';
// import { Navigation } from 'react-native-navigation';
// import DeviceInfo from 'react-native-device-info';
// import * as RNLocalize from 'react-native-localize';
import axios from 'axios';
import qs from 'qs';
// import constants from 'crossplatform/helpers/constants';
// import socketIo from './socketIo';

const param = require('jquery-param');

class Api {
  constructor() {
    this.setTimeOutId = null;
    // NetInfo.isConnected.addEventListener('connectionChange', this._onNetworkStatusChange);
  }

  _onNetworkStatusChange = isConnected => {
    if (!this.appStarted) {
      this.appStarted = true;
    } else if (!this.setTimeOutId) {
      this.isConnected = isConnected;
      this.setTimeOutId = setTimeout(this._checkIfNotify, 2000);
    }
  }

  verifyUser(url, files) {
    const fullURL = this.__buildUrl(url);

    const body = new FormData();
    body.append('authToken', this.token);
    body.append('file[0]', files[0]);
    body.append('file[1]', files[1]);

    return axios.post(fullURL, body)
      .then(this.__responseHandler)
      .catch(this.__requestErrorHandler);
  }

  _checkIfNotify = async () => {
    try {
      // const isCurrentlyConnected = await NetInfo.isConnected.fetch();
      // if (this.isConnected === isCurrentlyConnected) {
        // Navigation.showInAppNotification({
        //   dismissWithSwipe: true,
        //   autoDismissTimerSec: this.isConnected ? 5 : 60 * 60 * 24,
        //   screen: 'InAppNotification',
        //   passProps: {
        //     type: 'warning',
        //     message: `Network connection is ${this.isConnected ? 'established' : 'lost'}`,
        //   },
        // });
      // }
    } catch (err) {
      console.log(err);
    }
    clearTimeout(this.setTimeOutId);
    this.setTimeOutId = null;
  }

  __buildUrl(relativeUrl, params) {
    const args = _.clone(params);
    // _.each(args, (val, name) => {
    //   if (moment.isMoment(val)) {
    //     args[name] = val.format();
    //   }
    // });

    if (Array.isArray(relativeUrl)) {
      relativeUrl = relativeUrl.join('/');
    }

    const query = param(args || {});
    return `${config.apiUrl}${relativeUrl}${query ? `?${query}` : ''}`;
  }

  __responseHandler(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    let message;
    switch (response.status) {
      case 400:
        throw response.data;
      case 401:
      case 403:
        message = 'Access denied';
        break;
      case 404:
        message = '404: Not found';
        break;
      default:
        message = 'An unexpected error has occurred. Please contact support or try again later.';
        break;
    }
    // Navigation.showInAppNotification({
    //   screen: 'InAppNotification',
    //   passProps: {
    //     type: 'error',
    //     message,
    //   },
    // });
    const error = { ...response.data, response };
    throw error;
  }

  __requestErrorHandler(err) {
    if (err.response) {
      throw { ...err.response.data, _status: err.response.status };
    } else {
      throw err;
    }
  }

  __request(method, url, data) {
    const fullUrl = method === 'get' ? this.__buildUrl(url, data) : this.__buildUrl(url);
    const body = method === 'get' ? null : data;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.deviceToken) {
      headers['X-Device-Token'] = this.deviceToken;
    }

    if (this.FCMToken) {
      headers['X-FCM-Token'] = this.FCMToken;
    }

    // headers['X-Oauth-Client-Id'] = constants.clientId;

    headers['X-Os'] = Platform.OS;
    // headers['X-Os-Version'] = DeviceInfo.getSystemVersion();
    // headers['X-Device-Manufacturer'] = DeviceInfo.getManufacturer();
    // headers['X-Device-Model'] = DeviceInfo.getModel();
    // headers['X-Device-Unique-Id'] = DeviceInfo.getUniqueID();
    // headers['X-App-Name'] = DeviceInfo.getApplicationName();
    // headers['X-App-Version'] = DeviceInfo.getVersion();
    // headers['X-Client-Language'] = RNLocalize.getLocales().map(item => item.languageTag).join(', ');
    console.log('RQST', fullUrl, method, body);
    return axios({
      url: fullUrl,
      method: method.toUpperCase(),
      headers,
      data: body,
    })
      .then(this.__responseHandler)
      .catch(this.__requestErrorHandler);
  }

  setToken(token) {
    this.token = token;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      axios.defaults.headers.common = _.omit(axios.defaults.headers.common, ['Authorization']);
    }
  }

  setDeviceToken(deviceToken) {
    this.deviceToken = deviceToken;
  }

  setFCMToken(FCMToken) {
    this.FCMToken = FCMToken;
  }

  get(url, params) {
    return this.__request('get', url, params);
  }

  delete(url, params) {
    return this.__request('delete', url, params);
  }

  post(url, data) {
    return this.__request('post', url, data);
  }

  put(url, data) {
    return this.__request('put', url, data);
  }

  uploadFile(url, data) {
    const fullURL = this.__buildUrl(url);

    if (Platform.OS === 'android' && !_.startsWith(data.uri, 'file://')) {
      data.uri = `file://${data.uri}`;
    }

    const body = new FormData();
    body.append('authToken', this.token);
    body.append('data', data);

    return axios.post(fullURL, body)
      .then(this.__responseHandler)
      .catch(this.__requestErrorHandler);
  }

  postForm(url, data) {
    const fullUrl = this.__buildUrl(url);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      // 'X-Oauth-Client-Id': constants.clientId,
    };

    const instance = axios.create({});

    instance.interceptors.request.use((req) => {
      if (req.method === 'post') {
        req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        req.data = qs.stringify(req.data);
      }

      return req;
    }, (error) => Promise.reject(error));

    if (this.deviceToken) {
      headers['X-Device-Token'] = this.deviceToken;
    }

    if (this.FCMToken) {
      headers['X-FCM-Token'] = this.FCMToken;
    }

    return instance({
      url: fullUrl,
      method: 'post',
      headers,
      data,
    })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return { ...response.data, _response: response };
        }
        throw { ...response.data, _status: response.status };
      }).catch(err => {
        throw { ...err.response.data, _status: err.response.status };
      });
  }

  // waitForCommand(promise, timeout = 10000) {
  //   return new Promise((resolve, reject) => {
  //     promise.then(apiData => {
  //       const commandId = apiData.commandId;
  //       const waitTimeout = setTimeout(() => {
  //         resolve(null);
  //         console.log('not received command with id ['
  //           + commandId
  //           + ']  within '
  //           + (timeout / 1000)
  //           + ' seconds, executing callback.');
  //       }, timeout);

  //       function unsubscribe() {
  //         clearTimeout(waitTimeout);
  //         socketIo.off('command:processed', handleSuccess);
  //         socketIo.off('command:failed', handleFail);
  //       }

  //       function handleSuccess(data) {
  //         if (data.commandId === commandId && (!apiData.entity || apiData.entity === data.entity)) {
  //           unsubscribe();
  //           resolve(apiData);
  //         }
  //       }

  //       function handleFail(data) {
  //         if (data.commandId === commandId) {
  //           unsubscribe();
  //           console.log('An unexpected error has occurred. Please contact customer support');
  //           reject(apiData);
  //         }
  //       }

  //       socketIo.on('command:processed', handleSuccess);
  //       socketIo.on('command:failed', handleFail);
  //     }, (reason) => reject(reason));
  //   });
  // }

  // waitForEvent(promise, evts, evtChecker, timeout) {
  //   evtChecker = evtChecker || (() => true);

  //   const TIMEOUT = timeout || 10000; // 10 seconds by default

  //   let successEvent;
  //   let failureEvent;
  //   let genericEvent;

  //   if (_.isString(evts)) {
  //     genericEvent = evts;
  //   } else {
  //     successEvent = evts.success;
  //     failureEvent = evts.failure;
  //   }

  //   return promise.then(apiData => {
  //     return new Promise((resolve, reject) => {
  //       if (genericEvent) {
  //         socketIo.on(genericEvent, (evt, data) => {
  //           evtChecker(apiData, data, () => handleSuccess(evt, data, false), () => handleFail(evt, data, false))
  //         });
  //       }

  //       if (successEvent) {
  //         socketIo.on(successEvent, handleSuccess);
  //       }

  //       if (failureEvent) {
  //         socketIo.on(failureEvent, handleFail);
  //       }

  //       const waitTimeout = setTimeout(() => {
  //         resolve(null);
  //         console.log('not received event [' + successEvent + ']  within ' + TIMEOUT / 1000 + ' seconds, executing callback.');
  //       }, TIMEOUT);

  //       function handleSuccess(data, evt, checkEvent = true) {
  //         if (!checkEvent || evtChecker(apiData, data)) {
  //           unsubscribe();
  //           resolve(data);
  //         }
  //       }

  //       function handleFail(data, evt, checkEvent = true) {
  //         if (!checkEvent || evtChecker(apiData, data)) {
  //           unsubscribe();
  //           reject(data);
  //         }
  //       }

  //       function unsubscribe() {
  //         clearTimeout(waitTimeout);
  //         if (successEvent) {
  //           socketIo.off(successEvent, handleSuccess);
  //         }
  //         if (failureEvent) {
  //           socketIo.off(failureEvent, handleFail);
  //         }
  //       }
  //     });
  //   })
  // };
}

export default new Api();
