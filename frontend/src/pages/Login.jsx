import '../styles/Login.css'
import Form from "../components/Form"
import { useState } from 'react'
import { login } from '../api/authApi';
import { Navigate } from 'react-router-dom';


export default function Login({handleInputChange, formData, handleToken}) {

  const [responseMsg, setResponseMsg] = useState("")
  const [shouldRedirect, setShouldRedirect] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const context = {username: formData.username, password: formData.password}
    const token = await login(context)
    if(!token) {
      setResponseMsg("Error logging in")
    } else {
      localStorage.setItem("userToken", token); /*AI told me to add this when the token was not being passed if no (in-ganme) character existed after login */
      handleToken(token)
      setShouldRedirect(true)
    }
  }
  if (shouldRedirect) {
    return <Navigate to="/characters/"/>
  } else {
    return <Form formType={"Login"} handleInputChange={handleInputChange} formData={formData}handleToken={handleToken} handleSubmit={handleSubmit} responseMsg={responseMsg}/>
  }

}