import React from 'react';
import PropTypes from 'prop-types';
import Auth from '../modules/Auth';
import LoginForm from '../components/LoginForm.jsx';
import {LOGIN_URL} from '../constants/LoginConstants';



class LoginPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props, context) {
    super(props, context);

    const storedMessage = localStorage.getItem('successMessage');
    let successMessage = '';

    if (storedMessage) {
      successMessage = storedMessage;
      localStorage.removeItem('successMessage');
    }

    // set the initial component state
    this.state = {
      errors: {},
      successMessage,
      user: {
        email: '',
        password: ''
      }
    };

    this.processForm = this.processForm.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }

  /**
   * Process the form.
   *
   * @param {object} event - the JavaScript event object
   */
  processForm(event) {
    // prevent default action. in this case, action is the form submission event
    event.preventDefault();

    // create a string for an HTTP body message
    const email = encodeURIComponent(this.state.user.email);
    const password = encodeURIComponent(this.state.user.password);
    const formData = {'email':email,
                       'password':password
                     };
    //validate form 
    const validFormRes=validateLoginForm(formData);
    console.log('form data ',JSON.stringify(validFormRes));
    if(validFormRes.success)
    {
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('post', LOGIN_URL);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success

        // change the component-container state
        this.setState({
          errors: {}
        });

        // save the token
        Auth.authenticateUser(xhr.response.token);


        // change the current URL to /
        this.context.router.replace('/');
      } else {
        // failure

        // change the component state
        const errors ={};
        errors.summary = 'innernel error in server';

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
    }
    else
    {
       // change the component state
        const errors = validFormRes.errors ? validFormRes.errors : {};
        errors.summary = validFormRes.message;

        this.setState({
          errors
        });
    }

  }

  /**
   * Change the user object.
   *
   * @param {object} event - the JavaScript event object
   */
  changeUser(event) {
    const field = event.target.name;
    const user = this.state.user;
    user[field] = event.target.value;

    this.setState({
      user
    });
  }

  /**
   * Render the component.
   */
  render() {
    return (
      <LoginForm
        onSubmit={this.processForm}
        onChange={this.changeUser}
        errors={this.state.errors}
        successMessage={this.state.successMessage}
        user={this.state.user}
      />
    );
  }

}


/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateLoginForm(payload) {
  debugger;
  const errors = {};
  let isFormValid = true;
  let message = '';

  if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    isFormValid = false;
    errors.email = 'Please provide your email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    isFormValid = false;
    errors.password = 'Please provide password.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

LoginPage.contextTypes = {
  router: PropTypes.object.isRequired
};


export default LoginPage;
