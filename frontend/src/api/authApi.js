const BASE_URL = window.location.protocol + '//' + window.location.host;

async function basicFetch(url, payload) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, payload)
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
  const body = await basicFetch("/auth/signup",payload)
  return body
}

export const deleteCharacter = async (token, charId) => {
  try {
    const payload = {
      method: "DELETE",
      headers: { "Authorization": `Token ${token}` },
    };
    return await basicFetch(`/api/characters/${charId}/`, payload);
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
  const body = await basicFetch("/auth/get-token", payload)
  return body.token
}

export async function getSessions(token) {
  const payload = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`
    }
  }
  const body = await basicFetch("/api/sessions/", payload)
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
  const body = await basicFetch("/api/sessions/", payload)
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
  return await basicFetch("/api/characters/", payload)
}

export async function getCharacters(token) {
  const payload = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}` 
    }
  };
  return await basicFetch("/api/characters/", payload);
}

// 2. Perform 'Scavenge' Action
// This hits the @action in your SessionDetail viewset
export async function scavengeAction(token, sessionId) {
  const payload = {
    method: "POST", // Your view specifies methods=['post']
    headers: { "Authorization": `Token ${token}` }
  };

  return await basicFetch(`/api/sessions/${sessionId}/scavenge/`, payload);
}


export async function restAction(token, sessionId) {
  const payload = {
    method: "POST",
    headers: { "Authorization": `Token ${token}` }
  };
  return await basicFetch(`/api/sessions/${sessionId}/rest/`, payload);
}

export const performGameAction = async (token, sessionId, actionType) => {
  try {
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({ action_type: actionType }),
    };
    return await basicFetch(`/api/sessions/${sessionId}/take_action/`, payload);
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
};

export const endCycle = async (token, sessionId) => {
  try {
    const payload = {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    };
    return await basicFetch(`/api/sessions/${sessionId}/end_day/`, payload);
  } catch (err) {
    console.error("API Error (endCycle):", err);
    return null;
  }
};

export const resolveEvent = async (token, sessionId, choice) => {
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`, 
    },
    body: JSON.stringify({ choice: choice }),
  };
  
  return await basicFetch(`/api/sessions/${sessionId}/resolve_event/`, payload);
};