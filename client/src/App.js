import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import PrivateRoute from "./components/PrivateRoute";
import ErrorView from "./views/ErrorView";

import ProfileView from "./views/ProfileView";
import EditProfileView from "./views/EditProfileView";

import AllBooksView from "./views/AllBooksView";

import HomeView from "./views/HomeView";

import ClubAdminView from "./views/ClubAdminView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import ClubSearchView from "./views/ClubSearchView";
import SingleClubView from "./views/SingleClubView";

import Local from "./helpers/Local";
import Api from "./helpers/Api";

function App() {
  const [user, setUser] = useState(Local.getUser());
  const [loginErrorMsg, setLoginErrorMsg] = useState("");

  const [club, setClub] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [clubBooks, setClubBooks] = useState([]);

  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]); //state 1
  const [loading, setLoading] = useState(false); //state2
  const [error, setError] = useState(""); //state 3

  //get the clubs first
  async function getClubs() {
    setLoading(true);
    setError("");

    try {
      let response = await fetch("clubs");
      if (response.ok) {
        let data = await response.json();
        setClubs(data);
      } else {
        setError(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }
  let id = 1; // TODO: remove hardcoding when able

  console.log("club", club);
  console.log("clubBooks", clubBooks);

  useEffect(() => {
    fetchClub(id);
    fetchClubBooks(id);
  }, []);

  async function fetchClubBooks(id) {
    let myresponse = await Api.getClubBooks(`${id}`); //TODO: Change to ${club.id}
    if (myresponse.ok) {
      setClubBooks(myresponse.data);
      setErrorMsg("");
    } else {
      setClubBooks([]);
      let msg = `Error ${myresponse.status}: ${myresponse.error}`;
      setErrorMsg(msg);
    }
  }

  async function fetchClub(id) {
    let myresponse = await Api.getClub(id);
    if (myresponse.ok) {
      setClub(myresponse.data);
      setErrorMsg("");
    } else {
      setClub([]);
      let msg = `Error ${myresponse.status}: ${myresponse.error}`;
      setErrorMsg(msg);
    }
  }
  const postBook = (nextBookFormData) => {
    let postOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextBookFormData),
    };

    fetch("/books", postOptions)
      .then((res) => res.json())
      .then((json) => {
        setClubBooks(json);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const patchClub = (meetingDetailsFormData) => {
    let patchOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meetingDetailsFormData),
    };

    fetch("/clubs/:id", patchOptions)
      .then((res) => res.json())
      .then((json) => {
        console.log("nextmtgjson", json);
        setClub(json[0]);
        fetchClub(meetingDetailsFormData.club_id);
        fetchClubBooks(meetingDetailsFormData.club_id);
        navigate(`/clubs/${meetingDetailsFormData.club_id}`);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  async function doLogin(username, password) {
    let myresponse = await Api.loginUser(username, password);
    if (myresponse.ok) {
      Local.saveUserInfo(
        {
          username: myresponse.data.user.username,
          id: myresponse.data.user.id,
        },
        myresponse.data.token
      );
      setUser(myresponse.data.user);
      setLoginErrorMsg("");
      navigate("/");
    } else {
      setLoginErrorMsg("Login failed");
    }
  }

  function doLogout() {
    Local.removeUserInfo();
    setUser(null);
  }

  function registerUser(newUser) {
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      }),
    })
      .then((res) => {
        if (res.ok) {
          doLogin(newUser.username, newUser.password);
        }
      })
      .catch((error) => {
        console.log(`Server error: ${error.message}`);
      });
  }

  return (
    <div className="App">
      <NavBar user={user} logoutCb={doLogout} />{" "}
      <div className="container">
        <Routes>
          <Route
            path="/"
            element={<HomeView clubs={clubs} getClubs={getClubs} />}
          />

          <Route path="/books" element={<AllBooksView />} />

          <Route
            path="/login"
            element={
              <LoginView
                loginCb={(u, p) => doLogin(u, p)}
                loginError={loginErrorMsg}
              />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterView registerUser={(newUser) => registerUser(newUser)} />
            }
          />
          <Route
            path="/users/:userId"
            element={
              <PrivateRoute>
                <ProfileView user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/:userId/edit"
            element={
              <EditProfileView
                user={user}
                setUser={(user) => setUser(user)}
                clubs={clubs}
                setClubs={setClubs}
              />
            }
          />

          <Route
            path="*"
            element={<ErrorView code="404" text="Page not found" />}
          />
          <Route
            path="clubs/:clubId"
            element={
              <SingleClubView
                club={club}
                clubBooks={clubBooks}
                fetchClubBooks={fetchClubBooks}
                fetchClub={fetchClub}
              />
            }
          />
          <Route
            path="clubs/:clubId/club-admin"
            element={
              <ClubAdminView
                club={club}
                setClubCb={setClub}
                setClubBooksCb={setClubBooks}
                postBookCb={postBook}
                patchClubCb={patchClub}
              />
            }
          />
          <Route
            path="/clubs"
            element={<ClubSearchView setUser={(user) => setUser(user)} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
