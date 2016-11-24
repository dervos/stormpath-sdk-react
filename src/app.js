import { EventEmitter } from 'events';
import { LocalStorage } from './storage';
import { UserService, ClientApiUserService} from './services';
import { UserConstants, TokenConstants } from './constants';
import { UserStore, SessionStore, TokenStore } from './stores';
import { FluxDispatcher, ReduxDispatcher } from './dispatchers';

import utils from './utils';
import Context from './Context';

class App extends EventEmitter {
  constructor() {
    super();
    this.initialized = false;
  }

  isInitialized() {
    return this.initialized;
  }

  init(options) {
    options = options || {};

    if (this.isInitialized()) {
      throw new Error('React Stormpath already initialized.');
    }

    this.initialized = true;

    let tokenStore = null;
    let userService = null;
    let sessionStore = new SessionStore();

    if (!options.endpoints) {
      options.endpoints = {};
    }

    if (!options.storage) {
      options.storage = new LocalStorage('session');
    }

    let baseUri = options.endpoints.baseUri;

    if (baseUri && !utils.isSameHost(baseUri, window.location.href)) {
      tokenStore = new TokenStore(options.storage, 'stormpath:token');
      userService = new ClientApiUserService(options.endpoints);

      userService.setToken('access_token', tokenStore.get('access_token'));
      userService.setToken('refresh_token', tokenStore.get('refresh_token'));
    } else {
      userService = new UserService(options.endpoints);
    }

    let userStore = new UserStore(userService, sessionStore);

    Context.setTokenStore(tokenStore);
    Context.setSessionStore(sessionStore);
    Context.setUserStore(userStore);

    // If there's no specified dispatcher, then default to flux.
    let dispatcher = options.dispatcher || { type: 'flux' };

    let appReducer = (payload) => {
      switch(payload.type) {
        case UserConstants.USER_LOGIN:
          userStore.login(payload.options, payload.callback);
          break;
        case UserConstants.USER_LOGOUT:
          userStore.logout(payload.callback);
          break;
        case UserConstants.USER_REGISTER:
          userStore.register(payload.options, payload.callback);
          break;
        case UserConstants.USER_FORGOT_PASSWORD:
          userStore.forgotPassword(payload.options, payload.callback);
          break;
        case UserConstants.USER_CHANGE_PASSWORD:
          userStore.changePassword(payload.options, payload.callback);
          break;
        case UserConstants.USER_UPDATE_PROFILE:
          userStore.updateProfile(payload.options.data, payload.callback);
          break;
        case UserConstants.USER_VERIFY_EMAIL:
          userStore.verifyEmail(payload.options.spToken, payload.callback);
          break;
        case TokenConstants.TOKEN_SET:
          userService.setToken(payload.options.type, payload.options.token);

          if (payload.options.token !== null) {
            tokenStore.set(payload.options.type, payload.options.token);
          } else {
            tokenStore.reset(payload.options.type);
          }

          payload.callback && payload.callback();
          break;
        case TokenConstants.TOKEN_REFRESH:
          userService.refreshToken(payload.options.token, payload.callback);
          break;
      }
      return true;
    };

    switch (dispatcher.type) {
      case 'flux':
        dispatcher = new FluxDispatcher(appReducer);
        break;
      case 'redux':
        dispatcher = new ReduxDispatcher(appReducer, dispatcher.store);
        break;
      default:
        throw new Error('Stormpath SDK: Invalid dispatcher type ' + dispatcher.type);
    }

    Context.setDispatcher(dispatcher);
  }
}

export default new App()
