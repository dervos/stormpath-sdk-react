import { Route } from 'react-router';

import Context from './../Context';

export default class LoginRoute extends Route {
  static defaultProps = {
    onEnter(nextState, replace, callback) {
      Context.userStore.isAuthenticated((err, authenticated) => {
        if (authenticated) {
          var router = Context.getRouter();
          var homeRoute = router.getHomeRoute();
          var authenticatedHomeRoute = router.getAuthenticatedHomeRoute();
          var redirectTo = (authenticatedHomeRoute || {}).path || (homeRoute || {}).path || '/';

          replace(redirectTo);
        }
        callback();
      });
    }
  };
}
