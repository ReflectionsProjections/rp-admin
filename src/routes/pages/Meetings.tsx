import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Textarea,
  useDisclosure,
  Heading,
  Text,
  Grid,
  CardFooter,
  Flex,
  Checkbox,
} from '@chakra-ui/react';
import { EditIcon, AddIcon } from "@chakra-ui/icons";
import moment from 'moment-timezone';
import axios from "axios";
import { Config } from "../../config.ts";
import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const readable = "MMMM Do YYYY, h:mm a";

const jwt = localStorage.getItem("jwt");

const enum Team {
  Full = "FULL TEAM",
  Dev = "DEV",
  Design = "DESIGN",
  Content = "CONTENT",
  Corporate = "CORPORATE",
  Marketing = "MARKETING",
  Ops = "OPERATIONS"
}

interface JwtPayload {
  roles: string[];
}

const canDelete = (): boolean => {
  const auth = jwt !== null;

  if (!auth) {
    return false;
  }

  const decodedToken = jwtDecode(jwt) as JwtPayload;

  return decodedToken.roles.includes("ADMIN");
};

function convertToCST(date: string) {
  const m = moment.utc(date);
  m.tz('America/Chicago');
  return m;
}

function Meetings() {
  const [meetings, setMeetings] = React.useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newMeeting, setNewMeeting] = React.useState({
    meetingId: '',
    name: '',
    team: Team.Full,
    time: '',
    description: '',
    attendees: []
  });

  // const createMeeting = () => {
  //   axios.post(Config.API_BASE_URL + "/meeting", { ...newMeeting }, {
  //     headers: {
  //       Authorization: jwt
  //     }
  //   }).then(() => {
  //     getMeetings();
  //     setNewMeeting({
  //       meetingId: '',
  //       name: '',
  //       team: Team.Full,
  //       time: '',
  //       description: '',
  //       attendees: []
  //     });
  //     onClose(); // Close the modal after creating the meeting
  //   });
  // };


  // todo(): why am I allowed to create meetings with an invalid date (no input), but not events?

  const createMeeting = () => {
    const meetingsStored = localStorage.getItem("meetings");
    let meetings = [];
    if (meetingsStored != null) {
      meetings = JSON.parse(meetingsStored);
    }
    meetings.push(newMeeting);
    localStorage.setItem("meetings", JSON.stringify(meetings));

    getMeetings();
    setNewMeeting({
      meetingId: '',
      name: '',
      team: Team.Full,
      time: '',
      description: '',
      attendees: []
    });
    onClose(); // Close the modal after creating the meeting
  };

  // function getMeetings() {
  //   axios.get(Config.API_BASE_URL + "/meetings", {
  //     headers: {
  //       Authorization: jwt
  //     }
  //   }).then(function (response) {
  //     setMeetings(response.data);
  //   });
  // }

  function getMeetings() {
    const meetingsStored = localStorage.getItem("meetings");
    let meetings = [];
    if (meetingsStored != null) {
      meetings = JSON.parse(meetingsStored);
    }
    setMeetings(meetings);
  }

  function EditModal({ meeting }: { meeting: { meetingId: string, name: string, time: string, description: string, team: Team } }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [updatedValues, setUpdatedValues] = React.useState(meeting);

    React.useEffect(() => {
      setUpdatedValues(meeting);
    }, [meeting, isOpen]);

    const handleSave = () => {
      const updatedValuesUTC = {
        ...updatedValues,
        time: moment(updatedValues.time).utc().format(),
      };

      // const { meetingId, ...valuesWithoutMeetingId } = updatedValuesUTC;
      // axios.put(Config.API_BASE_URL + "/meeting/" + meeting.meetingId, {
      //   ...valuesWithoutMeetingId
      // }, {
      //   headers: {
      //     Authorization: jwt
      //   }
      // }).then(() => {
      //   getMeetings();
      //   onClose();
      // });

      const meetingsStored = localStorage.getItem("meetings");
      let meetings = [];
      if (meetingsStored != null) {
        meetings = JSON.parse(meetingsStored);
      }
      meetings as Array<{ meetingId: string }>; // typecast so we can analyze properties!
      for (let i = 0; i < meetings.length; i++) {
        if (meetings[i].meetingId == meeting.meetingId) {
          console.log("meetingId " + meeting.meetingId + " found");
          meetings[i] = updatedValuesUTC;
        }
      }
      localStorage.setItem("meetings", JSON.stringify(meetings));

      getMeetings();
    };

    return (
      <>
        <Button leftIcon={<EditIcon />} colorScheme="teal" variant="solid" onClick={onOpen}>
          Edit
        </Button>
        <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit meeting</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Input
                defaultValue={meeting.name}
                mb={4}
                onChange={(e) => setUpdatedValues({ ...updatedValues, name: e.target.value })}
              />
              <Select
                defaultValue={meeting.team}
                mb={4}
                onChange={(e) => setUpdatedValues({ ...updatedValues, team: e.target.value as Team })}
              >
                <option value={Team.Full}>Full Team</option>
                <option value={Team.Dev}>Dev</option>
                <option value={Team.Design}>Design</option>
                <option value={Team.Content}>Content</option>
                <option value={Team.Corporate}>Corporate</option>
                <option value={Team.Marketing}>Marketing</option>
                <option value={Team.Ops}>Operations</option>
              </Select>
              <Input
                type="datetime-local"
                defaultValue={convertToCST(meeting.time).format('yyyy-MM-DDTHH:mm')}
                mb={4}
                onChange={(e) => setUpdatedValues({ ...updatedValues, time: moment(e.target.value).format() })}
              />
              <Textarea
                defaultValue={meeting.description}
                mb={4}
                onChange={(e) => setUpdatedValues({ ...updatedValues, description: e.target.value })}
              />
              {/* <Checkbox
                isChecked={meeting.isVisible}
                onChange={(e) => setUpdatedValues({ ...updatedValues, isVisible: e.target.checked })}
              >
                Is Visible
              </Checkbox> */}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={handleSave}>
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }

  // const deleteMeeting = (meetingId: string) => {
  //   axios.delete(Config.API_BASE_URL + "/meetings/" + meetingId, {
  //     headers: {
  //       Authorization: jwt
  //     }
  //   }).then(() => {
  //     getMeetings();
  //   });
  // };

  const deleteMeeting = (meetingId: string) => {
    const meetingsStored = localStorage.getItem("meetings");
    let meetings = [];
    if (meetingsStored != null) {
      meetings = JSON.parse(meetingsStored);
    }
    meetings as Array<{ meetingId: string }>; // typecast so we can analyze properties!
    for (let i = 0; i < meetings.length; i++) {
      if (meetings[i].meetingId == meetingId) {
        console.log("meetingId " + meetingId + " found");
        meetings.splice(i, 1);
      }
    }
    localStorage.setItem("meetings", JSON.stringify(meetings));

    getMeetings();
  };

  function MeetingCard({ meeting }: { meeting: { meetingId: string, name: string, time: string, description: string, team: Team } }) {
    const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

    const confirmDelete = () => {
      deleteMeeting(meeting.meetingId);
      onCloseDelete();
    };

    return (
      <Card maxW='sm' key={meeting.meetingId}>
        <CardBody>
          {/*<Center>*/}
          {/*<Image src={event.imageUrl} alt={event.name} borderRadius='lg' />*/}
          {/*</Center>*/}
          <Stack mt='6' spacing='3'>
            <Heading size='md'> {meeting.name}</Heading>
            <Badge borderRadius="full" px="2" colorScheme={
              {
                [Team.Full]: 'green', [Team.Dev]: 'blue', [Team.Design]: 'blue',
                [Team.Content]: 'blue', [Team.Corporate]: 'blue', [Team.Marketing]: 'blue',
                [Team.Ops]: 'blue',
              }[meeting.team]}>
              {meeting.team + ' !'}
            </Badge>
            <Text>
              {convertToCST(meeting.time).format(readable)}
            </Text>
            <i> {/* todo: implement ids proper */}
              {"id- " + meeting.meetingId + " -id"}
            </i>
            <Text>
              {meeting.description}
            </Text>
          </Stack>
        </CardBody>

        <CardFooter>
          <Flex justifyContent="space-between" width="100%">
            <EditModal meeting={meeting} />
            <Button colorScheme='red' onClick={onOpenDelete} isDisabled={!canDelete()}>
              Delete
            </Button>
          </Flex>
        </CardFooter>
        <Modal isOpen={isDeleteOpen} onClose={onCloseDelete}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete this meeting?
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={confirmDelete}>
                Delete
              </Button>
              <Button onClick={onCloseDelete}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Card >
    );
  }

  const addDefaultMeetings = () => {
    const meetings = [];
    const datetime = moment(new Date()).utc().format();
    meetings.push({ meetingId: 'Test Meeting', name: 'Test Meeting', team: Team.Full, time: datetime, description: 'blah blah blah fill space for line wrap blah blah blah', attendees: [] });
    meetings.push({ meetingId: 'Example', name: 'Example', team: Team.Design, time: datetime, description: 'shoutout to design qfuoihe wqeofiuq wefgoqe fiuqweflgqef', attendees: [] });
    meetings.push({ meetingId: 'Warning', name: 'Warning', team: Team.Dev, time: datetime, description: 'These are not linked to the database! They are in localStorage', attendees: [] });

    localStorage.setItem("meetings", JSON.stringify(meetings));
    getMeetings();
  };

  useEffect(() => {
    getMeetings();
  }, []); // load in meetings on load

  // overall return! (Meetings page)
  return (
    <Box flex="1" minW='90vw' p={4}>
      <Flex justifyContent="center" alignItems="center">
        <Heading size="lg" onClick={addDefaultMeetings}>Meetings</Heading>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new meeting</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Input
              value={newMeeting.name}
              onChange={(e) => setNewMeeting({ ...newMeeting, name: e.target.value, meetingId: e.target.value })}
              placeholder="Meeting title"
              mb={4}
            />
            <Select
              value={newMeeting.team}
              onChange={(e) => setNewMeeting({ ...newMeeting, team: e.target.value as Team })}
              mb={4}
            >
              <option value={Team.Full}>Full Team</option>
              <option value={Team.Dev}>Dev</option>
              <option value={Team.Design}>Design</option>
              <option value={Team.Content}>Content</option>
              <option value={Team.Corporate}>Corporate</option>
              <option value={Team.Marketing}>Marketing</option>
              <option value={Team.Ops}>Operations</option>
            </Select>
            <Input
              type="datetime-local"
              value={newMeeting.time}
              onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
              mb={4}
            />
            <Textarea
              value={newMeeting.description}
              onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              placeholder="Meeting description"
              mb={4}
            />
            {/* <Checkbox
              isChecked={newEvent.isVisible}
              onChange={(e) => setNewEvent({ ...newEvent, isVisible: e.target.checked })}
            >
              Is Visible
            </Checkbox> */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={createMeeting}>
              Create meeting
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <br />
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        justifyItems='center' gap={6}>
        {meetings.map((meeting: { meetingId: string, name: string, time: string, description: string, team: Team, attendees: [] }) => <MeetingCard meeting={meeting} key={meeting.meetingId} />)}
      </Grid>
      <Button
        onClick={onOpen}
        colorScheme="gray"
        position="fixed"
        bottom="20px"
        left="20px"
        borderRadius="md"
        p={4}
        zIndex="1000"
        bg="gray.300"
        width="30px"
        height="30px"
      >
        <AddIcon />
      </Button>
    </Box>
  );
}

export default Meetings;
