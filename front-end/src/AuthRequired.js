import React from "react";
import { Redirect } from "react-router-dom";

export class AuthRequired extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (localStorage.getItem("token") == null) {
      return <Redirect to="/" />;
    } else {
      return this.props.orRender;
    }
  }
}

export default AuthRequired;
