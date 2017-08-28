import React, { Component } from 'react';
import './App.css';
import PAWBatteryImage from './assets/PAW-battery.png'
import carImage from './assets/car.png'

import Connection from './Connection'

const checkWaitTime = 2000;
const chargingUnitTime = 4000;

class App extends Component {
  state = {
    flowing: {
      1: false,
      2: false,
    },
  }

  componentDidMount() {
    this.checkNext();
  }

  isWorking(injectFlowing) {
    const flowing = injectFlowing ? injectFlowing : this.state.flowing;
    const working = Object.keys(flowing)
                    .some((key) => flowing[key])
    return working;
  }

  startWorking() {
    const flowing = Object.assign({}, this.state.flowing);
    if(Math.random()>0.4) {
      flowing[1] = true;
    }
    if(Math.random()>0.4) {
      flowing[2] = true;
    }

    this.setState({
      flowing,
    });

    console.log(flowing);

    return this.isWorking(flowing);
  }

  stopWorking() {
    const flowing = Object.assign({}, this.state.flowing);
    for (var key in flowing) {
      if (flowing.hasOwnProperty(key)) {
        flowing[key] = false;
      }
    }
    this.setState({ flowing });
  }

  checkNext = () => {
    let startedWorking = false;
    if(!this.isWorking()) {
      // Checking next;
      console.log('Check next');
      fetch('http://localhost:3000/api/Next')
      .then(res => res.json())
      .then(res => {
        if(Array.isArray(res)) {
          const cars = res
          .map(transaction => parseInt(transaction.owner.split('#')[1]))
          .reduce((accum, el) => {
            return Object.assign({}, accum, {[el]:true});
          }, {});

          this.setState({flowing:cars});
          startedWorking = this.isWorking(cars);
          if(startedWorking) {
            console.log('Started Working');
            setTimeout(() => {
              this.stopWorking();
              this.checkNext();
            }, chargingUnitTime)
          }else {
            setTimeout(this.checkNext, checkWaitTime);
          }
        }
      });
    }

  }

  render() {
    return (
      <div className="platform">
        <img alt="car 1" className="image" src={carImage} />
        <Connection inverted flowing={this.state.flowing[1] || false} />
        <img alt="charger" className="image" src={PAWBatteryImage} />
        <Connection flowing={this.state.flowing[2] || false} />
        <img alt="car 2" className="image" src={carImage} />
      </div>
    );
  }
}

export default App;
