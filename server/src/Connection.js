import React from 'react';
import PropTypes from 'prop-types';
import { LinearProgress } from 'material-ui/Progress';

class Connection extends React.Component {
  render() {
    const classNames = ['progress']
    if(this.props.inverted) classNames.push('inverted');
    const mode = this.props.flowing ? 'indeterminate' : 'determinate';
    return (
      <LinearProgress
        // color="#1d508d"
        className={classNames.join(' ')}
        mode={mode}
      />
    )
  }
}

Connection.propTypes = {
  flowing: PropTypes.bool.isRequired,
  inverted: PropTypes.bool,
}

export default Connection;
