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

export const deleteCharacter = async (token, charId) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/characters/${charId}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Token ${token}`,
      },
    });
    return response.ok;
  } catch (err) {
    console.error("Delete failed:", err);
    return false;
  }
};

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

export async function getSessions(token) {
  const payload = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`
    }
  }
  const body = await basicFetch("http://127.0.0.1:8000/api/sessions/", payload)
  return body
}

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

export async function getCharacters(token) {
  const res = await fetch("http://127.0.0.1:8000/api/characters/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
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

  return await basicFetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/scavenge/`, payload);
}


export async function restAction(token, sessionId) {
  const payload = {
    method: "POST",
    headers: { "Authorization": `Token ${token}` }
  };
  return await basicFetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/rest/`, payload);
}

export const performGameAction = async (token, sessionId, actionType) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/take_action/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({ action_type: actionType }),
    });
    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
};

export const endCycle = async (token, sessionId) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/end_day/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  } catch (err) {
    console.error("API Error (endCycle):", err);
    return null;
  }
};