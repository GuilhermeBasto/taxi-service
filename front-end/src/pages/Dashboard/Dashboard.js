import React, { Component } from "react";
import "./Dashboard.css";
import UserVoice from "../../assets/user-voice-line.svg";
import MapPin from "../../assets/map-pin-line.svg";
import Arrow from "../../assets/arrow-right-s-line.svg";
import AudioRecorder from "../../components/AudioRecorder/AudioRecorder";
import { sleep, randomGeo } from "./utils.js";
import $ from "jquery";
import { apiUrl } from "../../core/constants";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      translatedText: "",
      recording: false,
      jobId: "",
      destination: "",
      map: null,
      location_coordinates: null,
      location_marker: null,
      location_btn: false,
      location_options: [],
      route: [],
      processing: false,
      didGetLocations: false,
      defaultMarkerPosition: null,
      firstTime: true,
      reset: false,
      presentPrice: false,
      price: 0,
      endTrip: false,
    };

    this.addLocationMarker = this.addLocationMarker.bind(this);
    this.toogleLocationBtnState = this.toogleLocationBtnState.bind(this);
    this.addRouteShapeToMap = this.addRouteShapeToMap.bind(this);
    this.addRouteShapeToMap1 = this.addRouteShapeToMap1.bind(this);
    this.getJobId = this.getJobId.bind(this);
  }

  mapRef = React.createRef();

  confirmLocation = () => {
    this.setState({ translatedText: $("#location_text")[0].value });
    this.getGeolocation($("#location_text")[0].value);
    $("#location-text").hide();
  };

  confirmTrip = () => {
    this.setState({ presentTaxi: true });
    this.setState({ presentPrice: false });
  };

  endTrip = () => {
    this.setState({ endTrip: true });
    $("#priceDiv").hide();
  };

  rateTheTrip = () => {
    $("#endTripDiv").hide();
    window.location.reload();
  };

  addLocationMarker = (evt) => {
    const H = window.H;
    var map = this.state.map;
    // var location_marker = this.state.location_marker;

    var coord = map.screenToGeo(
      evt.currentPointer.viewportX,
      evt.currentPointer.viewportY
    );

    var newMarker = new H.map.Marker({ lat: coord.lat, lng: coord.lng });
    map.addObject(newMarker);
    this.setState({ location_marker: newMarker });
    this.setState({ location_coordinates: { lat: coord.lat, lng: coord.lng } });
  };

  toogleLocationBtnState() {
    console.log("Activate Marker");
    var map = this.state.map;
    var location_marker = this.state.location_marker;
    map.addEventListener("tap", this.addLocationMarker);

    if (location_marker !== null) {
      map.removeObjects([location_marker]);
    }

    $("#my-map").addClass("crosshair");
    this.setState({ location_marker: null });
    this.setState({ location_btn: true });
  }

  addRouteShapeToMap = (route) => {
    console.log("RouteShape");
    const H = window.H;
    var map = this.state.map;
    var lineString = new H.geo.LineString(),
      routeShape = route,
      polyline;

    routeShape.forEach(function (point) {
      lineString.pushLatLngAlt(point[0], point[1]);
    });

    polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 4,
        strokeColor: "rgba(0, 128, 255, 0.7)",
      },
    });
    // Add the polyline to the map
    map.addObject(polyline);
    // And zoom to its bounding rectangle
    map.getViewModel().setLookAtData({
      bounds: polyline.getBoundingBox(),
    });
  };

  addRouteShapeToMap1 = (route) => {
    console.log("Route Shape Maker");
    const H = window.H;
    var map = this.state.map;
    var lineString = new H.geo.LineString(),
      routeShape = route,
      polyline;

    routeShape.forEach(function (point) {
      lineString.pushLatLngAlt(point[0], point[1]);
    });

    polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 4,
        strokeColor: "rgba(255, 0, 0, 0.7)",
      },
    });
    // Add the polyline to the map
    map.addObject(polyline);
    // And zoom to its bounding rectangle
    map.getViewModel().setLookAtData({
      bounds: polyline.getBoundingBox(),
    });
  };

  componentWillMount() {
    if (localStorage.getItem("token") == null) {
      window.location.pathname = "/";
    }
  }

  componentDidUpdate() {
    var map = this.state.map;
    if (this.state.location_btn && this.state.location_marker !== null) {
      console.log("Desactivate Marker");
      map.removeEventListener("tap", this.addLocationMarker);
      $("#my-map").removeClass("crosshair");
      this.setState({ location_btn: false });
    }

    if (this.state.defaultMarkerPosition !== null && this.state.firstTime) {
      console.log(this.state.defaultMarkerPosition);
      const H = window.H;
      var newMarker = new H.map.Marker(this.state.defaultMarkerPosition);
      this.state.map.addObject(newMarker);
      this.setState({ location_marker: newMarker });
      this.setState({ firstTime: false });
      this.setState({ location_coordinates: this.state.defaultMarkerPosition });
    }
  }

  async getActualLoction() {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.setState({ defaultMarkerPosition: pos });
      this.state.map.setCenter(pos);
    });
  }

  async componentDidMount() {
    await this.getActualLoction();
    const H = window.H;
    const platform = new H.service.Platform({
      apikey: "AqbXvDyWICTRoeA0sqCl9WhKcJrtkwtEy7cK7xSGGX8",
    });

    const defaultLayers = platform.createDefaultLayers();

    const map = new H.Map(
      this.mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: {
          lat: "40.2115",
          lng: "-8.4292",
        },
        zoom: 14,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    const ui = H.ui.UI.createDefault(map, defaultLayers, "pt-PT");

    this.setState({ map });
  }

  async getGeolocation(destiny) {
    console.log(this.state);
    this.setState({ didGetLocations: true });
    const auth = localStorage.getItem("token");
    fetch(`${apiUrl}/geocode?location=${destiny}`, {
      mode: "cors",
      method: "GET",
      headers: {
        token: JSON.stringify({ token: auth }),
      },
    })
      .then((response) => response.json())
      .then((data) => this.setState({ location_options: data.body.items }));
  }

  async getRoute(dest) {
    this.setState({ reset: true });
    const auth = localStorage.getItem("token");
    const origin = `${this.state.location_coordinates.lat.toFixed(
      4
    )},${this.state.location_coordinates.lng.toFixed(4)}`;

    const destination = `${dest.lat.toFixed(4)},${dest.lng.toFixed(4)}`;

    var taxi_coords = randomGeo(this.state.location_coordinates, 2000);
    var aux_taxi_cords = `${taxi_coords.lat.toFixed(
      4
    )},${taxi_coords.lng.toFixed(4)}`;
    const H = window.H;
    var map = this.state.map;

    var taxi_marker = new H.map.Marker({
      lat: taxi_coords.lat,
      lng: taxi_coords.lng,
    });
    map.addObject(taxi_marker);

    var a =
      this.state.location_coordinates.lat.toFixed(4) - dest.lat.toFixed(4);
    var b =
      this.state.location_coordinates.lng.toFixed(4) - dest.lng.toFixed(4);
    var distance = (Math.sqrt(a * a + b * b) * 100 * 2).toFixed(2);
    this.setState({ price: distance });
    console.log(distance);
    fetch(`${apiUrl}/route?origin=${origin}&destination=${destination}`, {
      mode: "cors",
      method: "GET",
      headers: {
        token: JSON.stringify({ token: auth }),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.addRouteShapeToMap(data.body);
        console.log("data: " + data);
      });

    fetch(`${apiUrl}/route?origin=${aux_taxi_cords}&destination=${origin}`, {
      mode: "cors",
      method: "GET",
      headers: {
        token: JSON.stringify({ token: auth }),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.addRouteShapeToMap1(data.body);
        console.log("data: " + data);
      })
      .catch((err) => console.error("error in get route", err));

    $("#location-options").hide();
    this.setState({ presentPrice: true });
  }

  async getTranscribeStatus() {
    if (this.state.reset) {
      window.location.reload();
    }
    const jobId = this.state.jobId;
    const auth = localStorage.getItem("token");
    fetch(`${apiUrl}/speech-to-text?jobId=${jobId}`, {
      mode: "cors",
      method: "GET",
      headers: {
        token: JSON.stringify({ token: auth }),
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((err) => console.error("error in get transcribe status", err));
  }

  handleTranscribeStatus(status, text) {
    this.setState({ processing: false });
    switch (status) {
      case "COMPLETED":
        if (text === null || text === "") {
          this.setState({ translatedText: "Erro a traduzir..." });
        } else {
          this.setState({ translatedText: text });
        }
        break;
      case "FAILED":
        console.log("Transcribe job failed");
        break;
      default:
        console.log("error in Transcribe job");
    }
  }

  async getJobId(id) {
    this.setState({ processing: true });
    if (this.state.jobId === "") {
      this.setState({ jobId: id });
    }
    await sleep(10000);
    const jobId = this.state.jobId;
    const auth = localStorage.getItem("token");
    fetch(`${apiUrl}/speech-to-text?jobId=${jobId}`, {
      mode: "cors",
      method: "GET",
      headers: {
        token: JSON.stringify({ token: auth }),
      },
    })
      .then((response) => response.json())
      .then((res) =>
        res.body.status === "IN_PROGRESS"
          ? this.getJobId(this.state.jobId)
          : this.handleTranscribeStatus(res.body.status, res.body.text)
      )
      .catch((err) => console.error("error in get transcribe status", err));
  }

  logout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  render() {
    return (
      <div className="col-lg-12" style={{ display: "contents" }}>
        <div
          className="row nav-bar"
          style={{ width: "100vw", marginLeft: "0px" }}
        >
          <div className="logo-div">
            <img alt="" className="user-voice-icon" src={UserVoice}></img>
            <span className="login-header-title white-color">Call a Cab</span>
          </div>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => this.logout()}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              marginTop: "20px",
              marginRight: "1rem",
            }}
          >
            logout
          </button>
        </div>
        <div
          className="row"
          style={{
            boxShadow: "inset 0 -1px 0 0 #2B2B2B",
            width: "100vw",
            marginLeft: "0px",
          }}
        >
          <div className="col-lg-4 zero-padding">
            <div className="select-location">
              <span className="where-to-text">De Onde?</span>
              <div>
                <span className="example-location-text">Pressione o botão</span>

                <span className="pin-btn-example">
                  <img
                    alt=""
                    className="pin-icon"
                    src={MapPin}
                    style={{ marginTop: "-3px" }}
                  ></img>
                </span>

                <span className="example-location-text">
                  e selecione um ponto no mapa.
                </span>
              </div>
            </div>

            <div className="location">
              <span className="where-to-text">Para Onde?</span>
              {!this.state.processing && (
                <AudioRecorder jobId={this.getJobId} />
              )}
            </div>
            {this.state.processing && <div className="loader"></div>}
            {this.state.translatedText !== "" && (
              <div id="location-text" className="location-text-div">
                <div className="form-group">
                  <label style={{ fontSize: "20px" }}>
                    É esta a localização?
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="location_text"
                    defaultValue={this.state.translatedText}
                  />
                  <small
                    className="form-text text-muted"
                    style={{ fontSize: "14px" }}
                  >
                    Modifique a localização caso o pretenda.
                  </small>
                </div>
                <button
                  id="location-text-btn"
                  type="button"
                  className="btn btn-success login-btn"
                  onClick={() => this.confirmLocation()}
                >
                  Confirmar
                </button>
              </div>
            )}

            {this.state.presentPrice && (
              <div id="priceDiv" className="location-text-div">
                <div className="form-group">
                  <span style={{ fontSize: "18px", marginTop: "20px" }}>
                    A sua viagem fica em {this.state.price} €
                  </span>
                </div>
                <button
                  id="location-text-btn"
                  type="button"
                  className="btn btn-success login-btn"
                  onClick={() => this.confirmTrip()}
                >
                  Confirmar
                </button>
              </div>
            )}

            {this.state.presentTaxi && (
              <div id="priceDiv" className="location-text-div">
                <div className="row">
                  <span style={{ fontSize: "25px", marginLeft: "20px" }}>
                    Infomações do Taxista
                  </span>
                </div>
                <div className="row">
                  <span style={{ fontSize: "20px", marginLeft: "20px" }}>
                    Nome:
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      marginLeft: "10px",
                      marginTop: "auto",
                      marginBottom: "auto",
                    }}
                  >
                    Rui Silva
                  </span>
                </div>
                <div className="row">
                  <span style={{ fontSize: "20px", marginLeft: "20px" }}>
                    Rating:
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      marginLeft: "10px",
                      marginTop: "auto",
                      marginBottom: "auto",
                    }}
                  >
                    5
                  </span>
                </div>
                <button
                  id="location-text-btn"
                  type="button"
                  className="btn btn-success login-btn"
                  onClick={() => this.endTrip()}
                  style={{ marginTop: "10px" }}
                >
                  Terminar viagem
                </button>
              </div>
            )}

            {this.state.endTrip && (
              <div id="endTripDiv" className="location-text-div">
                <div className="form-group">
                  <label style={{ fontSize: "20px" }}>
                    Avalie a sua viagem
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="rating"
                    step="1"
                    min="0"
                    max="5"
                  />
                  <small
                    className="form-text text-muted"
                    style={{ fontSize: "14px" }}
                  >
                    Avalie a sua viagem de 0 até 5.
                  </small>
                </div>
                <button
                  id="location-text-btn"
                  type="button"
                  className="btn btn-success login-btn"
                  onClick={() => this.rateTheTrip()}
                >
                  Avaliar
                </button>
              </div>
            )}

            <div id="location-options" style={{ overflowY: "scroll" }}>
              {this.state.location_options.length === 0 &&
                this.state.didGetLocations && (
                  <h1>Não foram encontradas localizações!</h1>
                )}
              {this.state.location_options.map((location) => (
                <div
                  key={location.id}
                  className="row location-option-div"
                  onClick={(dest) => this.getRoute(location.position)}
                >
                  <div className="col-lg-2" style={{ padding: "20px" }}>
                    <span className="pin-btn-example">
                      <img
                        alt=""
                        className="pin-icon"
                        src={MapPin}
                        style={{ marginTop: "-3px" }}
                      ></img>
                    </span>
                  </div>

                  <div
                    className="col-lg-8"
                    style={{
                      display: "grid",
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    <span>{location.title}</span>
                  </div>

                  <div className="col-lg-2" style={{ padding: "20px" }}>
                    <img
                      alt=""
                      className="pin-icon"
                      src={Arrow}
                      style={{ marginTop: "3px", filter: "none" }}
                    ></img>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="col-lg-8 zero-padding"
            style={{
              paddingBottom: "1px",
              paddingLeft: "1px",
              boxShadow: "inset 1px 0 0 0 #2B2B2B",
            }}
          >
            <div ref={this.mapRef} className="map-div" id="my-map">
              <div
                className="pin-btn"
                onClick={() => this.toogleLocationBtnState()}
              >
                <img alt="" className="pin-icon" src={MapPin}></img>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
