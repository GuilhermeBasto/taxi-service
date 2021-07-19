import React, { Component } from "react";
import TaxiImage from "../../assets/taxi.jpg";
import UserVoice from "../../assets/user-voice-line.svg";
import User from "../../assets/user-line.svg";
import Lock from "../../assets/lock-line.svg";
import "./Login.css";
import { apiUrl } from "../../core/constants";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      responseData: "",
    };
  }

  componentDidUpdate() {
    if (this.state.responseData.statusCode === 200) {
      localStorage.setItem("token", this.state.responseData.body.token);
      window.location.pathname = "/dashboard";
    }
  }

  onChangeUsername = (event) => {
    this.setState({ ...this.state, username: event.target.value });
  };

  onChangePassword = (event) => {
    this.setState({ ...this.state, password: event.target.value });
  };

  async submitLogin() {
    fetch(`${apiUrl}/login`, {
      mode: "cors",
      method: "POST",
      body: JSON.stringify(this.state),
    })
      .then((response) => response.json())
      .then((data) => this.setState({ responseData: data }))
      .catch((err) => console.error("error in login", err));
  }

  render() {
    return (
      <div className="col-lg-12">
        <div className="row">
          <img alt="" className="taxi-img" src={TaxiImage}></img>
          <div className="login-div">
            <div className="login-header">
              <img alt="" className="login-header-img" src={UserVoice}></img>
              <span className="login-header-title">Call a Cab</span>
            </div>
            <div className="login-body">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <img alt="" className="user-img" src={User}></img>
                </div>

                <input
                  id="username"
                  type="text"
                  className="form-control"
                  placeholder="Nome de utilizador"
                  value={this.state.username}
                  onChange={this.onChangeUsername}
                />
              </div>

              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <img alt="" className="user-img" src={Lock}></img>
                </div>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Palavra chave"
                  value={this.state.value}
                  onChange={this.onChangePassword}
                />
              </div>
              <div
                style={{
                  display:
                    this.state.responseData.statusCode > 200 ? "block" : "none",
                }}
                id="error-msg"
              >
                <span className="login-error-msg">
                  O nome de utilizador e/ou a palavra chave estão incorrectos!
                </span>
              </div>
            </div>
            <div className="login-body">
              <button
                disabled={
                  !(this.state.password !== "" && this.state.username !== "")
                }
                id="login-btn"
                type="button"
                className="btn btn-success login-btn"
                onClick={() => this.submitLogin()}
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
