import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { setRolesUser, toggleUser } from "../api/users";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import CallMadeIcon from "@material-ui/icons/CallMade";
import CallReceivedIcon from "@material-ui/icons/CallReceived";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import AddBoxRoundedIcon from "@material-ui/icons/AddBoxRounded";
import Chip from "@material-ui/core/Chip";
import Checkbox from "../components/Checkbox";
import { useSnackbar } from "notistack";
const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default function DataTable(props) {
  const rows = props.data;
  const loading = props.loading;
  const classes = useStyles();
  const fetchUsers = props.fetchUsers;
  const { enqueueSnackbar } = useSnackbar();
  const [activeLoading, setActiveLoading] = useState(false);
  const [rolesArr, setRolesArr] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  const addRoles = ({ value, checked }) => {
    const newRoles = [...rolesArr];
    if (checked) {
      newRoles.push(value);
      setRolesArr(newRoles);
    } else {
      var newUncheckedRoles = newRoles.filter((e) => e !== value);
      setRolesArr(newUncheckedRoles);
    }
  };
  const handleOpen = (id) => {
    setUserId(id);
    setOpen(true);
    setRolesArr([]);
  };

  const handleClose = () => {
    setOpen(false);
    setRolesArr([]);
  };
  const activeUser = async (id, active) => {
    const toggleStatus = !active;
    const status = toggleStatus ? "ACTIVE" : "INACTIVE";
    setActiveLoading(true);
    const res = await toggleUser(id, toggleStatus);
    if (res.status === 200) {
      setActiveLoading(false);
      fetchUsers();
      enqueueSnackbar(`This user is ${status} now`);
    } else enqueueSnackbar(res.response.data.message);
  };

  const setRoles = async (id, roles) => {
    setActiveLoading(true);
    console.log(id, roles);
    const res = await setRolesUser(id, roles);
    if (res.status === 200) {
      setActiveLoading(false);
      fetchUsers();
      enqueueSnackbar(`This user is ${roles} now`);
    } else enqueueSnackbar("Something's wrong, try again later");
  };
  const setRolesArray = async () => {
    setActiveLoading(true);
    const res = await setRolesUser(userId, rolesArr);
    if (res.status === 200) {
      setActiveLoading(false);
      fetchUsers();
      setOpen(false);
      enqueueSnackbar("Set roles to this user successfully !");
    } else enqueueSnackbar("Something's wrong, try again later");
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">ID</TableCell>
                  <TableCell align="center">Emails</TableCell>
                  <TableCell align="center">Roles</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{row.id}</TableCell>
                    <TableCell align="center">{row.email}</TableCell>
                    <TableCell align="center">
                      {row.roles.map((item, index) => (
                        <Chip
                          color={item === "ADMIN" ? "secondary" : "primary"}
                          style={{ margin: "0 10px" }}
                          key={index}
                          label={item}
                        />
                      ))}
                      {row.roles.includes("ADMIN") ? (
                        <Tooltip title="Down to User">
                          <IconButton
                            onClick={() => setRoles(row.id, ["USER"])}
                            aria-label="down"
                          >
                            <CallReceivedIcon color="secondary" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Up to Admin">
                          <IconButton
                            onClick={() => setRoles(row.id, ["ADMIN"])}
                            aria-label="up"
                          >
                            <CallMadeIcon style={{ color: "green" }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Add roles">
                        <IconButton
                          onClick={() => handleOpen(row.id)}
                          aria-label="add"
                        >
                          <AddBoxRoundedIcon color="secondary" />
                        </IconButton>
                      </Tooltip>
                      <Modal
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        className={classes.modal}
                        open={open}
                        onClose={handleClose}
                        closeAfterTransition
                        BackdropComponent={Backdrop}
                        BackdropProps={{
                          timeout: 500,
                        }}
                      >
                        <Fade in={open}>
                          <div className={classes.paper}>
                            <h2 id="transition-modal-title">Add roles</h2>
                            <p id="transition-modal-description">
                              Add more roles
                            </p>
                            <div
                              style={{
                                margin: "10px 0",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Checkbox
                                value="ADMIN"
                                onSelected={({ value, checked }) => {
                                  addRoles({ value, checked });
                                }}
                              />
                              <Checkbox
                                value="USER"
                                onSelected={({ value, checked }) => {
                                  addRoles({ value, checked });
                                }}
                              />
                              <Checkbox
                                value="TAO LAO BI DAO"
                                onSelected={({ value, checked }) => {
                                  addRoles({ value, checked });
                                }}
                              />
                            </div>

                            <Button
                              style={{ margin: 10 }}
                              disabled={activeLoading}
                              variant="contained"
                              color="secondary"
                              onClick={setRolesArray}
                            >
                              OK
                            </Button>
                          </div>
                        </Fade>
                      </Modal>
                    </TableCell>
                    <TableCell align="center">
                      {row.active ? "Activating" : "Banned"}
                    </TableCell>
                    <TableCell align="center">
                      {row.active ? (
                        <Button
                          disabled={activeLoading}
                          variant="contained"
                          color="secondary"
                          onClick={() => activeUser(row.id, row.active)}
                        >
                          Inactive
                        </Button>
                      ) : (
                        <Button
                          disabled={activeLoading}
                          variant="contained"
                          onClick={() => activeUser(row.id, row.active)}
                        >
                          Active
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
}