import React from "react";
import ReactDOM from "react-dom";
import {LocationSearchInput} from "./autocomplete.js";
import {Heading, popupContent, popupHead, popupText, restaddr, restText, markOnMap} from "./stylesheet.js";

import {Map, Marker, Popup, TileLayer} from "react-leaflet";

const leafletMapStyle = {
    width: "100%", height: "700px"
};

const notFound = "https://uwosh.edu/facilities/wp-content/uploads/sites/105/2018/09/no-photo.png";



class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            latlong: [],
            latlongRest: null,
            attractionsInfo: [],
            restaurantInfo: [],
            centrePosition: [-23.6980, 133.8807],
            zoomCentre: 4,
            errorState: false,
            prevLatlong: []
        };
        this.handleClick = this.handleClick.bind(this);

    }

    handleClick(e) {
        this.setState({latlongRest: [e.latlng.lat, e.latlng.lng]});
    }

    dropPin = (state) => {
        if (state === null ) {
            return (this.state.centrePosition && <Marker position={this.state.centrePosition}>
                <Popup> Center
                </Popup>
            </Marker>)
        } else {
            return (
                this.state.latlongRest && <Marker position={this.state.latlongRest}>
                    <Popup> <div style={markOnMap}>You're here!</div>
                        <button onClick={this.fetchRestaurantsData} className="surpriseMe"> Eats nearby</button>
                    </Popup>
                </Marker>

            )
        }
    }

    welcome() {
        return (
            <div style={Heading}>
                <h1> Find attractions near </h1>
            </div>
        )
    }

    fields() {
        return (
            <div className="updateButton">
                <button
                    className="surpriseMe"
                    type="button"
                    onClick={this.fetchAttractionData}
                >Go to destination!
                </button>
            </div>
        );
    }

    nullErrorInputbox = (state) => {
        if (state === true) return (<div className='lilError'><span>Error Searching, try again.</span></div>)
    }

    fetchAttractionData = () => {
        console.log(this.state.centrePosition);
        if (this.state.latlong[0] > -90 && this.state.latlong[0] < 90 && this.state.latlong[1] > -180
            && this.state.latlong[1] < 180) {
            let method = {method: "GET"};
            const baseurl = "http://52.23.236.120:8000/?";
            let query = "latlong=" + this.state.latlong[0] + "," + this.state.latlong[1];

            let url = baseurl + query;
            fetch(encodeURI(url), method)
                .then(result => {
                    return (result.json())
                })
                .then(data => {
                    let results = data.results;
                    this.setState({attractionsInfo: results});
                })
                .catch(function (error) {
                    console.log(
                        "There has been a problem with your fetch operation: ",
                        error.message
                    );
                });
            this.setState({
                restaurantInfo: [],
                zoomCentre: 12,
                centrePosition: this.state.latlong,
                errorState: false
            });
          } else {
            this.setState({errorState: true});
        }
    }

    fetchRestaurantsData = () => {
        let method = {method: "GET"};
        const baseurl = "http://52.23.236.120:8000/search?";
        let query = "lat=" + this.state.latlongRest[0] + "&long=" + this.state.latlongRest[1];
        let url = baseurl + query;

        fetch(encodeURI(url), method)
            .then(result => {
                return (result.json())
            })
            .then(data => {
                let results = data.results;
                this.setState({restaurantInfo: results});
            })
            .catch(function (error) {
                console.log(
                    "There has been a problem with your fetch operation: ",
                    error.message
                );
            });
        this.setState({
            attractionsInfo: [],
            zoomCentre: 12,
            centrePosition: this.state.latlongRest
        });
    }

    doNotShowZero = (item) => {
        if (item !== 0) {
            return (
                <div style={restText}>${item / 2} PP</div>
            );
        }
    }

    receiveState = (latlong, state) => {
        this.setState({
            latlong: latlong,
            errorState: state
        });
    }

    foundImage(item) {
        if (item !== undefined) return item;
        else return notFound;
    }

    sizeImage(item) {
        if (item === undefined) return "150";
    }

    renderAttractionMarkers = arr => {
        let markerArr = [];
        arr.map((item, i) => {
            markerArr.push(
                <Marker key={i} position={item.latlong}>
                    <Popup>
                        <div style={popupContent}>
                            <img
                                src={this.foundImage(item.thumbnail)}
                                width={this.sizeImage(item.thumbnail)}
                                height={this.sizeImage(item.thumbnail)}
                            />
                            <div style={popupHead}>
                                {item.name}
                            </div>
                            <span style={popupText}>{item.description}</span>
                            <div style={restText}> {item.distanceToPin}M away</div>
                        </div>
                    </Popup>
                </Marker>
            )
        });
        return markerArr;
    }

    renderRestMarkers = arr => {
        let markerArr = [];
        arr.map((item, i) => {
            markerArr.push(
                <Marker key={i} position={item.latlongRest}>
                    <Popup>
                        <div style={popupContent}>
                            <div style={popupHead}>
                                {item.name}
                            </div>
                        </div>
                        <div style={restaddr}>
                            Address: {item.address}
                        </div>
                        <div style={restText}> Cuisines: {item.cuisines}</div>
                        {this.doNotShowZero(item.cost)}
                    </Popup>
                </Marker>
            )
        });
        return markerArr;
    }

    render() {

        return (
            <div className="onepage">
                {this.welcome()}
                <div className="inputDiv"><LocationSearchInput passingState={this.receiveState}/></div>
                {this.nullErrorInputbox(this.state.errorState)}
                {this.fields()}
                <div className="or">OR</div>
                <div className="pinInstruction">DROP A PIN</div>
                {/*Leaflet Map*/}
                <Map center={this.state.centrePosition} zoom={this.state.zoomCentre} onclick={this.handleClick}
                     style={leafletMapStyle}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                    />
                    {this.renderAttractionMarkers(this.state.attractionsInfo)}
                    {this.renderRestMarkers(this.state.restaurantInfo)}
                    {this.dropPin(this.state.latlongRest)}
                </Map>
            </div>

        );
    }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
