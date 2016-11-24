import React from 'react';
import utils from '../utils';
import Context from '../Context';

export default class UserComponent extends React.Component {
  onChangeListener = null;

  constructor() {
    super(...arguments);
    utils.logWarning('The UserComponent class has been deprecated. Please use the user Context instead. See: https://github.com/stormpath/stormpath-sdk-react/blob/master/docs/api.md#Contexts');
  }

  state = {
    user: {}
  };

  onChange() {
    Context.userStore.resolveSession((err, user) => {
      if (this.onChangeListener !== null) {
        this.setState({ user: user });
      }
    });
  }

  componentDidMount() {
    this.onChangeListener = this.onChange.bind(this);
    Context.userStore.addChangeListener(this.onChangeListener);
    this.onChange();
  }

  componentWillUnmount() {
    Context.userStore.removeChangeListener(this.onChangeListener);
    this.onChangeListener = null;
  }
}
