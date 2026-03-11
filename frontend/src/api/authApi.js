async function basicFetch(url, payload) {
  const res = await fetch(url, payload)
  const body = await res.json()
  return body
}


export async function signup(context) {
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(context)
  }
  const body = await basicFetch("http://localhost:8000/auth/signup",payload)
  return body
}

export async function login(context) {
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(context)
  }
  const body = await basicFetch("http://localhost:8000/auth/get-token", payload)
  return body.token
}

export async function getWines(token) {
  const payload = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`
    }  }
  const body = await basicFetch("http://localhost:8000/api/wines", payload)
  return body.result
}

// 2. Fetch all game sessions for the logged-in user
export async function getSessions(token) {
  const payload = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`
    }
  }
  // The Router handles 'sessions/' automatically
  const body = await basicFetch("http://127.0.0.1:8000/api/sessions/", payload)
  return body
}

// 3. Create a new session (Start a new game)
export async function createSession(token, sessionData) {
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`
    },
    body: JSON.stringify(sessionData)
  }
  const body = await basicFetch("http://127.0.0.1:8000/api/sessions/", payload)
  return body
}

export async function createCharacter(token, characterData) {
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`
    },
    body: JSON.stringify(characterData)
  }
  return await basicFetch("http://127.0.0.1:8000/api/characters/", payload)
}

// In authApi.js
export async function getCharacters(token) {
  const res = await fetch("http://127.0.0.1:8000/api/characters/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // IMPORTANT: Ensure this says "Token " with a space!
      "Authorization": `Token ${token}` 
    }
  });
  return await res.json();
}

// 2. Perform 'Scavenge' Action
// This hits the @action in your SessionDetail viewset
export async function scavengeAction(token, sessionId) {
  const payload = {
    method: "POST", // Your view specifies methods=['post']
    headers: { "Authorization": `Token ${token}` }
  };
  // URL format: /api/sessions/{id}/scavenge/
  return await basicFetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/scavenge/`, payload);
}

// 3. Perform 'Rest' Action
export async function restAction(token, sessionId) {
  const payload = {
    method: "POST",
    headers: { "Authorization": `Token ${token}` }
  };
  // URL format: /api/sessions/{id}/rest/
  return await basicFetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/rest/`, payload);
}