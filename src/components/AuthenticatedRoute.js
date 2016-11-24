import { Route } from 'react-router';

import Context from './../Context';

export default class AuthenticatedRoute extends Route {
  static defaultProps = {
    onEnter(nextState, replace, callback) {
      Context.userStore.isAuthenticated({
        inGroup: this.inGroup
      }, (err, authenticated) => {
        if (!authenticated) {
          var router = Context.getRouter();
          var homeRoute = router.getHomeRoute();
          var loginRoute = router.getLoginRoute();
          var redirectTo = (loginRoute || {}).path || (homeRoute || {}).path || '/';

          replace(redirectTo);
        }
        callback();
      });
    }
  };
}
