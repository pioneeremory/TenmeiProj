import malePng from "../assets/maleCharacter.png";
import femalePng from "../assets/femaleCharacter.png";
import "../styles/Form.css";
function Form({ formType, handleInputChange, formData, handleSubmit, responseMsg }) {
  // Define if this is an authentication form (Login/Signup) or Character Creation
  const isAuthForm = formType === 'Login' || formType === 'Signup';
  const isCreateCharacter = formType === 'Create Character';

  return (
    <div className="auth-container">
      <div className="auth-card">
        {responseMsg && <p className="response-msg">{responseMsg}</p>}

        <h2>{formType}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Conditional Rendering Logic */}
          
          {isAuthForm && (
            // --- AUTHENTICATION FIELDS (Login/Signup) ---
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ''} // Handle potential undefined
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
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {isCreateCharacter && (
            // --- CHARACTER CREATION FIELDS ---
            <>
              <div className="form-group">
                <label htmlFor="name">Character Name</label>
                <input
                  type="text"
                  name="name" // Matches the name field in serializers.py
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Logan"
                />
              </div>

              {/* PIXEL ART SELECTION BLOCK */}
              <div className="form-group character-art-selection">
                <label>Select Your Identity</label>
                
                <div className="art-options">
                  {/* Male Option */}
                  <label className={`art-label ${formData.is_male ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="is_male"
                      value="true" // Value as string
                      checked={formData.is_male === true}
                      onChange={handleInputChange}
                    />
                    <img src={formData.maleImage} alt="Male Character" />
                    <span>Brother</span>
                  </label>

                  {/* Female Option */}
                  <label className={`art-label ${!formData.is_male ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="is_male"
                      value="false" // Value as string
                      checked={formData.is_male === false}
                      onChange={handleInputChange}
                    />
                    <img src={formData.femaleImage} alt="Female Character" /> 
                    <span>Sister</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-submit">
            {formType === 'Login'
              ? 'Enter the City'
              : formType === 'Signup'
              ? 'Join the Resistance'
              : 'Forge Identity'}
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
