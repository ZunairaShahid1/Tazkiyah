import React, { useEffect, useState } from 'react';
import './GoalAcheivement.css';
import avatar from "../../assets/img/avatar.png"
import FlagIcon from '@mui/icons-material/Flag';
import axios from 'axios';
import ToastContainer, { FailedToast } from '../toast';
import { useSelector } from 'react-redux';
import DeleteConfirmationModel from './../DeleteConfirmationModel';
const GoalAcheivement = ({ edit, handleRowClick }) => {
    const setterId = useState(useSelector(state => state)?.userId)
    const [progressValue, setProgressValue] = useState(0);
    const progressEndValue = 100;
    const speed = 50;
    const [data, setData] = useState(null);
    const [fetchAgain, setFetchAgain] = useState(false);
    const [completionRate, setCompletitionRate] = useState(0);
    const currentDate = new Date();
    const currentDatePlus24Hours = new Date();
    currentDatePlus24Hours.setDate(currentDatePlus24Hours.getDate() + 1);
    const [confirmDelete, setDelete] = useState(false);
    const [deleteModel, setDeleteModel] = useState(false);
    const [goalId, setGoalId] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_PORT}/goals/${setterId[0]}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => {
            setData(res.data.data);
        }).catch(err => {
            FailedToast(err.response.data.message)
        });
    }, [fetchAgain]) //eslint-disable-line
    const [show, setShow] = useState(-1);
    const [showMilestone, setShowMilestone] = useState(-1);
    const [selectedMilestone, setSelectedMilestone] = useState(null)
    const [userData, setUserData] = useState({})

    useEffect(() => {
        if (confirmDelete) {
            const handledelete = () => {
                axios.delete(`${process.env.REACT_APP_BACKEND_PORT}/goals/${goalId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }).then((res) => {
                    ToastContainer("Goal Deleted")
                    setDelete(false)
                    setFetchAgain(!fetchAgain);
                }).catch(err => {
                    FailedToast(err.response.data.message)
                });
            }
            handledelete();
        }
    }, [confirmDelete])

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_PORT}/performanceAnalytics/${setterId[0]}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => {
            setUserData(res.data);
            const completionRate1 = ((res.data.completedGoals / (res.data.notCompletedGoals + res.data.completedGoals + res.data.pendingGoals)) * 100) || 0;
            setCompletitionRate(completionRate1.toFixed(2))

            // setData([res.data.completedGoals ?? 0, res.data.notCompletedGoals ?? 0, res.data.pendingGoals ?? 0])
        }).catch(err => {
        }
        );
    }, [fetchAgain])
    const handleChangeStatus = (event, id) => {
        event.stopPropagation();
        axios.patch(`${process.env.REACT_APP_BACKEND_PORT}/goals/status/${id}/${setterId[0]}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => {
            ToastContainer("Goal Status Changed")
            setFetchAgain(!fetchAgain);
        }).catch(err => {
            console.log(err);
            // FailedToast(err.response.data.message)
        });
    }

    useEffect(() => {
        const progress = setInterval(() => {
            setProgressValue((prevValue) => {
                if (prevValue < progressEndValue) {
                    return prevValue + 1;
                } else {
                    clearInterval(progress);
                    return prevValue;
                }
            });
        }, speed);

        return () => {
            clearInterval(progress);
        };
    }, [progressValue]); // Run the effect only once when the component mounts

    const progressDegrees = progressValue * 3.6;

    return (
        <div style={{ paddingLeft: "40px", paddingTop: "20px", marginBottom: "70px" }}>
            <div className='flex justify-center items-center flex-wrap'>
                <div className='flex flex-col justify-center mr-10'>
                    <div className="container-goal">
                        <div className="circular-progress">
                            <div className="value-container">{`${completionRate}%`}</div>
                        </div>
                        <style>{`
                    .circular-progress {
                        background: conic-gradient(
                            #4d5bf9 ${completionRate * 3.6}deg,
                            #cadcff ${completionRate}deg
                            );
                        }
                        `}</style>
                    </div>
                    <p style={{ margin: "10px 0", color: "gray" }}>Overall Progress</p>
                </div>
                <div className='flex justify-center items-center flex-wrap'>
                    <div style={{ boxShadow: "3px 3px 10px rgba(60, 60, 150, 0.25)", height: "170px", width: "150px", margin: "20px" }} className='flex justify-center flex-col items-center'>
                        <p style={{ fontSize: "36px", color: "gray", fontWeight: "bold", padding: "20px 0 40px 0" }}>{userData.completedGoals}</p>
                        <p style={{ fontSize: "20px" }}>Completed</p>
                    </div>
                    <div style={{ boxShadow: "3px 3px 10px rgba(60, 60, 150, 0.25)", height: "170px", width: "180px", margin: "20px" }} className='flex justify-center flex-col items-center'>
                        <p style={{ fontSize: "36px", color: "gray", fontWeight: "bold", padding: "20px 0 40px 0" }}>{userData.notCompletedGoals}</p>
                        <p style={{ fontSize: "20px" }}>Not Completed</p>
                    </div>
                    <div style={{ boxShadow: "3px 3px 10px rgba(60, 60, 150, 0.25)", height: "170px", width: "150px", margin: "20px" }} className='flex justify-center flex-col items-center'>
                        <p style={{ fontSize: "33px", color: "gray", fontWeight: "bold", padding: "20px 0 40px 0" }}>{userData.pendingGoals}</p>
                        <p style={{ fontSize: "18px" }}>Pending</p>
                    </div>
                </div>
            </div>
            <div style={{ padding: "0 " }}>
                <hr style={{ marginTop: "40px" }} />
                {
                    data?.map((Items, index) => {
                        const goalEndDate = new Date(Items.endDate);
                        const shouldRenderMarkAsCompleted = goalEndDate >= currentDate || (goalEndDate < currentDate && goalEndDate.getDate() === currentDate.getDate() - 1 && goalEndDate.getMonth() === currentDate.getMonth() && goalEndDate.getFullYear() === currentDate.getFullYear());

                        return (
                            <div style={{ cursor: "pointer" }} key={index + 100 * 100}>
                                <div onClick={() => { setShow(show === index ? -1 : index); setSelectedMilestone(null); setShowMilestone(-1) }} className='flex my-3 item-goal-acheivement items-center justify-between'>
                                    <FlagIcon className='flagicon' style={{ fontSize: "40px", marginRight: "10px", flex: 1 }} />
                                    <img style={{ width: "50px", height: "50px" }} src={avatar} alt="" />
                                    <h1 className='font-semibold ml-5 goal-text' style={{ color: "gray", flex: 1 }}>{Items.goalTitle}</h1>
                                    <p className='font-semibold ml-5' style={{ color: "gray", flex: 1 }}>{Items.goalstatus}</p>
                                    <p className='font-semibold ml-5' style={{ color: "gray", flex: 1 }}>{Items.startDate}</p>
                                    <p className='font-semibold ml-5' style={{ color: "gray", flex: 1 }}>{Items.endDate}</p>
                                    {
                                        !edit && Items.goalStatus === 'Pending' && shouldRenderMarkAsCompleted && (
                                            <button
                                                onClick={(event) => handleChangeStatus(event, Items._id, Items)}
                                                style={{ cursor: 'pointer', backgroundColor: "rgba(200, 0 , 0 , 0.8)", color: "#fff", padding: "7px 14px", margin: "0 20px 0 0", fontSize: "14px" }}
                                            >
                                                Mark as Completed
                                            </button>
                                        )
                                    }
                                    {edit && (
                                        <>
                                            <button onClick={() => handleRowClick(Items._id, Items)} style={{ cursor: 'pointer', backgroundColor: "#15375c", color: "#fff", padding: "7px 14px", margin: "0 20px 0 0", fontSize: "14px" }}>Edit</button>
                                            <button onClick={() => { setGoalId(Items._id); setDeleteModel(true) }} style={{ cursor: 'pointer', backgroundColor: "rgba(200, 0 , 0 , 0.8)", color: "#fff", padding: "7px 14px", margin: "0 20px 0 0", fontSize: "14px" }}>Delete</button>
                                        </>
                                    )}
                                </div>
                                {
                                    show === index && (
                                        <div>
                                            {
                                                Items.milestones.map((Milestone, index1) => (
                                                    <div key={index + 1098}>
                                                        <div onClick={() => { setShowMilestone(showMilestone === index1 ? -1 : index1); setSelectedMilestone(Milestone); }} className='flex justify-center items-center flex-wrap'>
                                                            <img className='flagicon' style={{ fontSize: "40px", marginRight: "0px", flex: 1 }} alt="" />
                                                            <h1 className='font-semibold ml-5 goal-text' style={{ color: "gray", flex: 1, fontWeight: "bold" }}>Milestone {index1 + 1}</h1>
                                                            <h1 className='font-semibold ml-5 goal-text' style={{ color: "gray", flex: 1 }}>{Milestone.goal}</h1>
                                                            <div style={{ flex: 1 }} className="container-goal-acheivement">
                                                                <div className="skill-box flex">
                                                                    <div className="skill-bar">
                                                                        <span
                                                                            className="skill-per"
                                                                            style={{
                                                                                width: `${Milestone.percentage}%`,
                                                                                background: '#4070f4',
                                                                            }}
                                                                        >
                                                                            <span className="tooltip">{Milestone.percentage}</span>
                                                                        </span>
                                                                    </div>
                                                                    <span className="ml-3">{Milestone.percentage}%</span>
                                                                </div>
                                                            </div>
                                                            <p className='font-semibold ml-5' style={{ color: "gray", flex: 1 }}>{Milestone.status}</p>
                                                            <p className='font-semibold ml-5' style={{ color: "gray", flex: 1 }}>{Milestone.endDate}</p>
                                                            <p className='font-semibold ml-5' style={{ color: "gray", flex: 1 }}>{Milestone.startDate}</p>
                                                        </div>
                                                        {
                                                            showMilestone === index1 && selectedMilestone && (
                                                                <div>
                                                                    {
                                                                        selectedMilestone.achievement.map((achievements, index2) => (
                                                                            <div className='flex items-center w-2/3 m-auto' key={index2}>
                                                                                <h1 className='font-semibold ml-5 goal-text' style={{ color: "gray", flex: 1, fontWeight: "bold" }}>Acheivement {index2 + 1}</h1>
                                                                                <h1 className='font-semibold ml-5 goal-text' style={{ color: "gray", flex: 1 }}>{achievements.name}</h1>
                                                                                <div style={{ flex: 1 }} className="container-goal-acheivement">
                                                                                    <div className="skill-box flex">
                                                                                        <div className="skill-bar">
                                                                                            <span
                                                                                                className="skill-per"
                                                                                                style={{
                                                                                                    width: `${achievements.percentage}%`,
                                                                                                    background: '#4070f4',
                                                                                                }}
                                                                                            >
                                                                                                <span className="tooltip">{achievements.percentage}</span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <span className="ml-3">{achievements.percentage}%</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                                <hr />
                            </div>
                        );
                    })
                }
            </div>
            <DeleteConfirmationModel open={deleteModel} setOpen={setDeleteModel} setDelete={setDelete} />
        </div>
    );
};

export default GoalAcheivement;
