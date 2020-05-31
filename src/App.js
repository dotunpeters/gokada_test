import React from 'react';
import './App.css';
import { Map, InfoWindow, GoogleApiWrapper, Marker, Polyline } from 'google-maps-react';
import Geocode from "react-geocode";
import Autocomplete from 'react-google-autocomplete';

Geocode.setApiKey("AIzaSyDIsQHrrGCCf_Svkj2SPUpUhC7PVMTogVA");
Geocode.setLanguage("en");

const mapStyles = {
  height: '400px',
};

class AutoLoad extends React.Component{
  render(){
    return (
      <div></div>
    );
  }
}

class Autofill extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      input: ""
    };
  }

  componentDidMount(){
    //this.nameInput.focus();
    this.setState({
      input: this.props.input,
    });
  }

  render(){
    
    return(
      <div className="addressbar">
        <p onClick={this.props.handleSwitch}><span>&#60;</span>Back</p>
        <h5>{this.props.formName}</h5>
        {/* <div>
          <input className="inputform" ref={(input) => { this.nameInput = input; }} onChange={this.handleChange} onKeyPress={this.handleKeyPress} value={this.state.input} name={this.props.formName} placeholder={this.props.placeholder} />
        </div> */}
        <div>
        <Autocomplete
          className="inputform"
          onPlaceSelected={(place) => {
            this.props.setGeoCoords(place.formatted_address, this.props.formName)
            console.log(place.formatted_address);
          }}
          types={['(regions)']}
          componentRestrictions={{country: "ng"}}
          placeholder={this.props.placeholder}
        />
        </div>
      </div>
      
    );
  }

  handleChange = (event) => {
    //code goes here
    this.setState({
      input: event.target.value
    });
  } 

  handleKeyPress = (event) => {
    //code goes here
    if (event.key === "Enter"){
      this.props.handleSubmit(this.state.input, event.target.name);
    }
    else{

    }
  }
}

class App extends React.Component{
  constructor(props){
    super(props);
    this.cost = "₦15,000";
    this.distance = 3.3;
    this.time = 24;
    this.state = {
      search: false,
      formName: "",
      pickup: "",
      pickupGeo: [0, 0],
      dropoff: "",
      dropoffGeo: [0, 0],
      placeholder: "",
      input: "",
      currentLocation: []
    }
  }

  componentDidMount(){
    //get geolocation
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(this.handleReceived, this.handleError, {enableHighAccuracy: true});
    }
  }
  
  handleReceived = (position) => {
    this.setState({
      currentLocation: [position.coords.latitude, position.coords.longitude]
    })
  }
  

  handleError = (positionError) => {
    console.log(positionError);
  }


  render(){
    if (this.state.search){
      return (
        <div>
          <Autofill
            handleSwitch = {this.handleSwitch}
            handleSubmit = {this.handleSubmit}
            handleChange = {this.handleChange}
            formName = {this.state.formName}
            placeholder = {this.state.placeholder}
            pickup = {this.state.pickup}
            dropoff = {this.state.dropoff}
            staticData = {this.state.staticData}
            input = {this.state.input}
            currentLocation = {this.state.currentLocation}
            setGeoCoords = {this.setGeoCoords}
          />
        </div>
      );
    }
    else if (this.state.currentLocation.length > 0) {
      return (
        <div>  
          <div className="addressbar">
            <h5>Parcel request</h5>
            <div>
              <input className="inputform" onChange={this.handleChange} onClick={this.handleSwitch} onKeyPress={this.handleSwitch} value={this.state.pickup} name="Pickup" placeholder="Pickup address" />
            </div>
            <div>
              <input className="inputform" onChange={this.handleChange} onClick={this.handleSwitch} onKeyPress={this.handleSwitch} value={this.state.dropoff} name="Dropoff" placeholder="Dropoff address" />
            </div>
          </div>
  
          <div className="temp">
            <Map
              google={this.props.google}
              zoom={14}
              style={mapStyles}
              initialCenter={{lat: this.state.currentLocation[0], lng: this.state.currentLocation[1]}}
              zoomControl={false}
              disableDoubleClickZoom={true}
              fullscreenControl={false}
              rotateControl={false}
              scrollwheel={false}
              className={"map"}
            >
            <Marker
              title={'Your location'}
              name={'Your location'}
              position={{lat: this.state.currentLocation[0], lng: this.state.currentLocation[1]}}
              options={{ icon: { url: require("./marker.png"), scaledSize: {width: 25, height: 25} } }}
            />
            <InfoWindow>
              <div>
                <h1>Your Location</h1>
              </div>
            </InfoWindow>
            <Marker
              title={'Pickup >'}
              name={'Pickup >'}
              position={{lat: this.state.pickupGeo[0], lng: this.state.pickupGeo[1]}}
              options={{ icon: { url: require("./marker.png"), scaledSize: {width: 32, height: 32} } }}
            />
            <Marker
              title={'Dropoff >'}
              name={'Dropoff >'}
              position={{lat: this.state.dropoffGeo[0], lng: this.state.dropoffGeo[1]}}
              options={{ icon: { url: require("./marker.png"), scaledSize: {width: 32, height: 32} } }}
            />
            <Polyline 
                path={[ 
                  {lat: this.state.pickupGeo[0], lng: this.state.pickupGeo[1]},
                  {lat: this.state.dropoffGeo[0], lng: this.state.dropoffGeo[1]},
                ]} 
                options={{ 
                  strokeColor: '#00ffff',
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  icons: [{ 
                    offset: '0',
                    repeat: '10px'
                  }],
                }}
            />
            </Map>
          </div>
  
          <div className={this.state.pickup === "" || this.state.dropoff === "" ? "hide" : "infobox"} >
            <div>
              <p className="left">{this.cost}<small>.00</small></p>
              <p className="right">{this.distance}km | {this.time}mins</p>
              <p className="button">Enter Parcel Details</p>
            </div>
          </div>
        </div>
      );
    }
    else{
      return (
        <div>
          <AutoLoad/>
        </div>
      );
    }
  }

  setGeoCoords = (address, formName) => {
    // Get latidude & longitude from address.
    Geocode.fromAddress(address).then(
      response => {
        const { lat, lng } = response.results[0].geometry.location;
        if (formName.toLowerCase() === "pickup"){
          this.setState(state => ({
            search: !state.search,
            pickup: address,
            currentLocation: [lat, lng],
            pickupGeo: [lat, lng] 
          }));
        }else{
          this.setState(state => ({
            search: !state.search,
            dropoff: address,
            dropoffGeo: [lat, lng] 
          }));
        }
        console.log(lat, lng);
      },
      error => {
        console.error("formName: " + formName.toLowerCase());
        if (formName.toLowerCase() === "pickup"){
          this.setState(state => ({
            search: !state.search,
            pickup: address
          }));
        }else{
          this.setState(state => ({
            search: !state.search,
            dropoff: address 
          }));
        }
      }
    );
  }

  handleSubmit = (value, target) => {
    //code goes here
    target = target.toLowerCase()
    if (target === "dropoff"){
      this.setState(state => ({
        search: !state.search,
        dropoff: value
      }))
    }
    else{
      this.setState(state => ({
        search: !state.search,
        pickup: value
      }))
    }
  }

  handleSwitch = (event) => {
    //code goes here
    const formName = event.target.name;
    this.setState(state => ({
      search: !state.search,
      formName: formName,
      placeholder: formName + " address",
    }));
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDIsQHrrGCCf_Svkj2SPUpUhC7PVMTogVA'
})(App);
