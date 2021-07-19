import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AuthRequired from "./AuthRequired";
function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/dashboard" render={() => (
            <AuthRequired 
              orRender={ <Dashboard />}
            />)}>
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
