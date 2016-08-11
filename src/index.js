import React from 'react';
import {
  render
} from 'react-dom';
import {
  Provider
} from 'react-redux';
import {
  Router,
  Route,
  browserHistory
} from 'react-router';
import store from 'modules';
import App from 'components/App/App';

export default render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} />
    </Router>
  </Provider>
), document.getElementById('app'));
