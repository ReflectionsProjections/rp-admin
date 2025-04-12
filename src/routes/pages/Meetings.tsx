import rpLogo from '../../assets/rp_logo.svg';
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
  useDisclosure,
  Heading,
  Text,
  Grid,
  CardFooter,
  Flex,
  // Checkbox,
} from '@chakra-ui/react';
import { EditIcon, AddIcon } from "@chakra-ui/icons";
import moment from 'moment-timezone';
import axios from "axios";
import { Config } from "../../config.ts";
import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { QRCode } from "react-qrcode-logo";

const readable = "MMMM Do YYYY, h:mm a";

const jwt = localStorage.getItem("jwt");

const enum Team {
  Content = "CONTENT",
  Corporate = "CORPORATE",
  Design = "DESIGN",
  Dev = "DEV",
  Full = "FULL TEAM",
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
    committeeType: Team.Full,
    startTime: '',
    // attendees: []
  });

  const createMeeting = () => {
    console.log("Attempting to send meeting with committeeType: " + newMeeting.committeeType + ", startTime: " + newMeeting.startTime);
    axios.post(Config.API_BASE_URL + "/meetings", { ...newMeeting }, {
      headers: {
        Authorization: jwt
      }
    }).then(() => {
      getMeetings();
      setNewMeeting({
        committeeType: Team.Full,
        startTime: '',
        // attendees: []
      });
      onClose(); // Close the modal after creating the meeting
    });
  };

  function getMeetings() {
    axios.get(Config.API_BASE_URL + "/meetings", {
      headers: {
        Authorization: jwt
      }
    }).then(function (response) {
      setMeetings(response.data);
    });
  }

  function EditModal({ meeting }: { meeting: { meetingId: string, committeeType: Team, startTime: string } }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [updatedValues, setUpdatedValues] = React.useState(meeting);

    React.useEffect(() => {
      setUpdatedValues(meeting);
    }, [meeting, isOpen]);

    const handleSave = () => {
      const updatedValuesUTC = {
        ...updatedValues,
        startTime: moment(updatedValues.startTime).utc().format(),
      };

      const { meetingId, ...valuesWithoutMeetingId } = updatedValuesUTC;
      axios.put(Config.API_BASE_URL + "/meetings/" + meetingId, {
        ...valuesWithoutMeetingId
      }, {
        headers: {
          Authorization: jwt
        }
      }).then(() => {
        getMeetings();
        onClose();
      });
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
              <Select
                defaultValue={meeting.committeeType}
                mb={4}
                onChange={(e) => setUpdatedValues({ ...updatedValues, committeeType: e.target.value as Team })}
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
                defaultValue={convertToCST(meeting.startTime).format('yyyy-MM-DDTHH:mm')}
                mb={4}
                onChange={(e) => setUpdatedValues({ ...updatedValues, startTime: moment(e.target.value).format() })}
              />
              {/* <Checkbox
                isChecked={meeting.isVisible}
                onChange={(e) => setUpdatedValues({ ...updatedValues, isVisible: e.target.checked })}
              >
                Is Visible
              </Checkbox> */}
              <br />
              <Stack alignItems={'center'}>
                <Text fontStyle={'italic'}>edit meeting attendance through Attendance page</Text>
              </Stack>
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

  const deleteMeeting = (meetingId: string) => {
    axios.delete(Config.API_BASE_URL + "/meetings/" + meetingId, {
      headers: {
        Authorization: jwt
      }
    }).then(() => {
      getMeetings();
    });
  };

  function MeetingCard({ meeting }: { meeting: { meetingId: string, committeeType: Team, startTime: string } }) {
    const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
    const { isOpen: isQrCodeOpen, onOpen: onOpenQrCode, onClose: onCloseQrCode } = useDisclosure();
    const qrCodeRef = React.useRef<QRCode>(null);

    const confirmDelete = () => {
      deleteMeeting(meeting.meetingId);
      onCloseDelete();
    };

    function copyQrCode() {
      if (!qrCodeRef.current) {
        return;
      }
      const canvas = (
        qrCodeRef.current as unknown as {
          canvasRef: { current: HTMLCanvasElement }
        }
      ).canvasRef.current;
      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard
            .write([new ClipboardItem({ "image/png": blob })])
            .catch(() => {
              alert("Failed to copy QR code.");
            });
        }
      }, "image/png");
    }

    function downloadQrCode() {
      if (!qrCodeRef.current) {
        return;
      }
      qrCodeRef.current.download("png", `${meeting.committeeType + " " + convertToCST(meeting.startTime).format("MM/DD/YYYY")} QR Code.png`);
    }

    return (
      <Card maxWidth="sm" key={meeting.meetingId}>
        <CardBody>
          {/*<Center>*/}
          {/*<Image src={event.imageUrl} alt={event.name} borderRadius='lg' />*/}
          {/*</Center>*/}
          <Stack mt='6' spacing='3'>
            <Heading size='md'> {meeting.committeeType + " " + convertToCST(meeting.startTime).format("MM/DD/YYYY")}</Heading>
            <Badge borderRadius="full" px="2" colorScheme={
              {
                [Team.Full]: 'pink', [Team.Dev]: 'blue', [Team.Design]: 'blue',
                [Team.Content]: 'blue', [Team.Corporate]: 'blue', [Team.Marketing]: 'blue',
                [Team.Ops]: 'blue',
              }[meeting.committeeType]}>
              {meeting.committeeType + ' !'}
            </Badge>
            <Text>
              {convertToCST(meeting.startTime).format(readable)}
            </Text>
          </Stack>
        </CardBody>

        <CardFooter>
          <Flex justifyContent="space-between" width="100%">
            <EditModal meeting={meeting} />
            <Button colorScheme='gray' mx="5" onClick={onOpenQrCode}>
              QR
            </Button>
            <Button colorScheme='red' onClick={onOpenDelete} isDisabled={!canDelete()}>
              Delete
            </Button>
          </Flex>
        </CardFooter>
        {/* QR CODE MODAL */}
        <Modal isOpen={isQrCodeOpen} onClose={onCloseQrCode} isCentered>
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent alignItems="center" onClick={onCloseQrCode}>
            <ModalHeader>Attendance: {meeting.committeeType + " " + convertToCST(meeting.startTime).format("MM/DD/YYYY")}</ModalHeader>
            <QRCode ref={qrCodeRef} logoImage={rpLogo} logoPadding={0.05} logoPaddingStyle='circle' value={meeting.meetingId}
              size={window.innerWidth > 400 ? window.innerWidth * 0.25 : window.innerWidth * 0.9} />
            <Flex justifyContent="center" gap="5" width="100%">
              <Button colorScheme="blue" m="5" onClick={copyQrCode}>
                Copy
              </Button>
              <Button colorScheme="blue" m="5" onClick={downloadQrCode}>
                Download
              </Button>
            </Flex>
          </ModalContent>
        </Modal>
        {/* DELETE MEETING MODAL */}
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

  useEffect(() => {
    getMeetings();
  }, []); // load in meetings on load

  // overall return! (Meetings page)
  return (
    <Box flex="1" minW='90vw' p={4}>
      <Flex justifyContent="center" alignItems="center">
        <Heading size="lg">Meetings</Heading>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new meeting</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Select
              value={newMeeting.committeeType}
              onChange={(e) => setNewMeeting({ ...newMeeting, committeeType: e.target.value as Team })}
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
              value={newMeeting.startTime}
              onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
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
      <Grid templateColumns={{ base: "repeat(1, fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        justifyItems='center' gap={6}>
        {/* accesses `meetings` object */}
        {meetings.map((meeting: { meetingId: string, committeeType: Team, startTime: string }) => <MeetingCard meeting={meeting} key={meeting.meetingId} />)}
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

