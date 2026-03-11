function Form({formType, handleInputChange, formData, handleSubmit, responseMsg}) {

  return (
    <div className="auth-container"> {/* The Dark Slate wrapper */}
      <div className="auth-card">     {/* The Bronze-bordered box */}
        
        {responseMsg && <p className="response-msg">{responseMsg}</p>}
        
        <h2>{formType}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="e.g. Kyoto_Samurai"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            {formType === 'Login' ? 'Enter the City' : 'Join the Resistance'}
          </button>
        </form>
        
      </div>
    </div>
  );
}

export default Form;
// function Form({formType, handleInputChange, formData, handleSubmit, responseMsg}) {

//   return (
//       <div className="auth-container"> 
//       <div className="auth-card">    
//     <>
//     {responseMsg && <h2>{responseMsg}</h2>}
//     <div className="login">
//       <h2>{formType}</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="username">Username</label>
//           <input
//             type="text"
//             name="username"
//             value={formData.username}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
//         <button type="submit">{formType}</button>
//       </form>
//     </div>
//     </>
//     </div>
//     </div>
//   );
// }

// export default Form;
