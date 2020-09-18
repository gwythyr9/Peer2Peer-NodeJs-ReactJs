import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";


import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";


import { Provider } from "react-redux";
import store from "./store";
import { setCurrentUser, logoutUser } from "./actions/authActions";


import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/private-route/PrivateRoute";
import Layout from "./components/dashboard/Layout";
import NotFound from "./components/404/404";

import "./App.scss";


if (localStorage.jwtTokenTeams) {
  const token = JSON.parse(localStorage.jwtTokenTeams);
  setAuthToken(token);

  const decoded = jwt_decode(token);

  store.dispatch(setCurrentUser(decoded));

  const currentTime = Date.now() / 1000; 
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());

    window.location.href = "./";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Switch>
              <Route exact path="/" component={Login} />
              <Route exact path="/register" component={Register} />
              <PrivateRoute exact path="/dashboard" component={Layout} />
              <Route
                component={localStorage.jwtTokenTeams ? Layout : NotFound}
              />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
