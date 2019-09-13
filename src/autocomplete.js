import React from 'react';
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from 'react-places-autocomplete';


class LocationSearchInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            location: '',
            latlong: [],
            errorState: false,
        };
    }

    handleChange = location => {
        this.setState({location: location});
    };

    handleSelect = location => {
        this.setState({location:location});
        geocodeByAddress(location)
            .then(results => getLatLng(results[0]))
            .then(({lat, lng}) => {
                this.setState({errorState: false});
                this.setState({latlong: [lat, lng]});
                this.props.passingState(this.state.latlong, this.state.errorState);
                })
            .catch(error => {
                this.setState({errorState: true})
                this.props.passingState(this.state.latlong, this.state.errorState);
                console.error('Error', error)});
    };

    render() {
        return (
            <PlacesAutocomplete
                value={this.state.location}
                onChange={this.handleChange}
                onSelect={this.handleSelect}
            >
                {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
                    <div>
                        <input className="inputBox" placeholder="Search places..."
                            {...getInputProps()}
                        />
                        <div className="autocomplete-dropdown-container">
                            {loading && <div>Loading...</div>}
                            {suggestions.map(suggestion => {
                                const className = suggestion.active
                                    ? 'suggestion-item--active'
                                    : 'suggestion-item';
                                // inline style for demonstration purpose
                                const style = suggestion.active
                                    ? {backgroundColor: 'rgba(15, 15, 15, 0.01)', cursor: 'pointer'}
                                    : {backgroundColor: 'rgba(15, 15, 15, 0.01)', cursor: 'pointer'};
                                return (
                                    <div
                                        {...getSuggestionItemProps(suggestion, {
                                            className,
                                            // style,
                                        })}
                                    >
                                        <span>{suggestion.description}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </PlacesAutocomplete>
        );
    }
}

export {LocationSearchInput}