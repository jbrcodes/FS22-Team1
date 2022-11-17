import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ClubBookshelf from "../components/ClubBookshelf";
import NextMeetingInfo from "../components/NextMeetingInfo";
import Api from "../helpers/Api";
import "./SingleClubView.css";

function SingleClubView(props) {
  let { clubId } = useParams();
  // const [club, setClub] = useState("");
  // const [errorMsg, setErrorMsg] = useState("");
  // const [clubBooks, setClubBooks] = useState({});
  // let id = 1; // TODO: remove hardcoding when able

  // console.log("club", club);
  // console.log("clubBooks", clubBooks);

  // useEffect(() => {
  //   props.fetchClub(clubId);
  // }, [props.clubBooks]);

  // useEffect(() => {
  //   props.fetchClubBooks(clubId);
  // }, [props.club]);

  //Get clubs's books
  // async function fetchClubBooks() {
  //   let myresponse = await Api.getClubBooks(`${id}`); //TODO: Change to ${club.id}
  //   if (myresponse.ok) {
  //     setClubBooks(myresponse.data);
  //     setErrorMsg("");
  //   } else {
  //     setClubBooks([]);
  //     let msg = `Error ${myresponse.status}: ${myresponse.error}`;
  //     setErrorMsg(msg);
  //   }
  // }

  // async function fetchClub(id) {
  //   let myresponse = await Api.getClub(id);
  //   if (myresponse.ok) {
  //     setClub(myresponse.data);
  //     setErrorMsg("");
  //   } else {
  //     setClub([]);
  //     let msg = `Error ${myresponse.status}: ${myresponse.error}`;
  //     setErrorMsg(msg);
  //   }
  // }

  // if (!props.club.name) {
  //   console.log("loading", props.club);
  //   return <h2>Loading</h2>;
  // }
  return (
    <div className="SingleClubView mt-5">
      {props.club.name ? (
        <div>
          <h1>{props.club.name}</h1>
          {/* <img src={props.club.image} alt={props.club.name} /> */}
          <div className="row mt-5">
            <div className="col mb-3">
              <NextMeetingInfo club={props.club} clubBooks={props.clubBooks} />
            </div>

            <div className="col mb-6">
              <h2>About Our Club</h2>
              <h3>Category: {props.club.category}</h3>
              <h3>
                Location: {props.club.next_mtg_city},{" "}
                {props.club.next_mtg_country}
              </h3>
              <img src={props.club.image} alt={props.club.name} />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-4">
              <h2>Members</h2>
              <div>
                {/* {props.members.map((m) => (
                  <h3>m.userName</h3>
                ))} */}
              </div>
            </div>

            <div className="col">
              <ClubBookshelf club={props.club} clubBooks={props.clubBooks} />
            </div>
          </div>
        </div>
      ) : (
        <h2>Loading</h2>
      )}
    </div>
  );
}

export default SingleClubView;
