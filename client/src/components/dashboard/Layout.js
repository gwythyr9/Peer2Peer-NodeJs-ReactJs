import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter
} from "react-router-dom";
import Peer from 'peerjs';

import TopNav from "./TopNav/TopNav";
import NotFound from "../404/404";

import "./Layout.scss";

class Layout extends Component {
  constructor(props) {
    super(props);

    this.videoSelf = React.createRef();
    this.videoCall = React.createRef();

    const { id } = this.props.auth.user;
    this.state = {
      recipient: '',
      peer: new Peer(id, {
        host: '18.194.116.241',
        port: 80,
        path: 'peerjs/myapp'
      })
    }

  }

  componentDidMount() {
    navigator.getUserMedia = (
      navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia
    );

    this.state.peer.on('open', (id) => console.log('Peer ID: ' + id));
    this.state.peer.on('call', this.onReceiveCall.bind(this));
    this.prepareSelfVideo();


  }
  getMedia(options, success, error) {
    navigator.getUserMedia(options, success, error);
  }

  onReceiveCall(call) {
    this.getMedia({ audio: true, video: true }, (stream) => {
      console.log("answering..");
      call.answer(stream)
    }, (err) => console.log(err));

    call.on('stream', (stream) => {
      this.videoCall.current.srcObject = stream;
    });
  }

  onReceiveStream = (stream) => {
    this.videoCall.current.srcObject = stream;
  }

  prepareSelfVideo() {
    this.getMedia({ audio: false, video: true }, (stream) => {

      this.videoSelf.current.srcObject = stream;
    }, (err) => console.log(err));
  }

  call = () => {
    this.getMedia({ audio: true, video: true }, (stream) => {
      const call = this.state.peer.call(this.state.recipient, stream);
      console.log("calling..");
      call.on('stream', this.onReceiveStream);
    }, (err) => console.log(err));
  }

  handleChangeRecipient = event => {
    this.setState({ recipient: event.target.value });
  };

  componentWillUnmount() {
    this.state.peer.disconnect();
  }

  render() {
    let dashboardContent;
    dashboardContent = (
      <>
        <TopNav />
        <Switch>
          <Route
            exact
            path="/dashboard"
          />
          <Route component={NotFound} />
        </Switch>
      </>
    );

    return (
      <Router>
        <div className="wrapper">
          {dashboardContent}
          <div className="main-content">
            <div className="call-control">
              <label className="user-label">
                Your peer id:
              </label>
              <label className="user-peerid">
                {this.state.peer.id}
              </label>
              <label className="recipient-label">
                Enter  your friend`s peer id
              </label>
              <input
                type="text"
                name="username"
                value={this.state.recipient}
                onChange={this.handleChangeRecipient}
                className="recipient-input"
              />
              <button
                onClick={() => this.call()}
                className="call-button"
              >
                Call
              </button>
            </div>
            <div className="video-container">
              <video ref={this.videoSelf} className="video-self" autoPlay></video>
              <video ref={this.videoCall} className="video-call" autoPlay></video>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

Layout.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default withRouter(
  connect(
    mapStateToProps,
  )(Layout)
);
