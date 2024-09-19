import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  Switch,
  useToast,
  Text,
  RadioGroup,
  Radio
} from "@chakra-ui/react";
import { Config } from "../../config.ts";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";

function EventCheckin() {
  const toast = useToast();
  const [showWebcam, setShowWebcam] = useState(false); // Toggle between webcam and email input
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [qrData, setQrData] = useState("");
  const [filteredEmails, setFilteredEmails] = useState<{ email: string; userId: string }[]>([]);
  const [attendeeEmails, setAttendeeEmails] = useState<{ email: string; userId: string }[]>([]);

  const [selectedMerch, setSelectedMerch] = useState("")

  const showToast = (message: string, error: boolean) => {
    toast({
      title: message,
      status: error ? "error" : "success",
      duration: 9000,
      isClosable: true,
    });
  };

  const showQuickToast = (message: string, error: boolean) => {
    toast({
      title: message,
      status: error ? "error" : "success",
      duration: 2000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");

    axios
      .get(Config.API_BASE_URL + '/attendee/emails', {
        headers: {
          Authorization: jwt,
        },
      })
      .then(function (response) {
        const attendeeData = response.data;
        setAttendeeEmails(attendeeData);
      })
      .catch(function () {
        showToast('Error fetching attendee emails + info.', true);
      });
  }, []);

  useEffect(() => {
    if (userId == "") {
      return;
    }
    const jwt = localStorage.getItem("jwt");
    // axios
    //   .get(Config.API_BASE_URL + `/attendee/id/${userId}`, {
    //     headers: {
    //       Authorization: jwt,
    //     },
    //   })
    //   .then((response) => {
    //     const user = response.data;
    //   })
    //   .catch((err) =>  {
    //     console.log(err);
    //     showToast('Error fetching attendee.', true);
    //   });
    console.log("redeeming merch");

    axios
    .post(Config.API_BASE_URL + `/attendee/redeemMerch/${selectedMerch}`, { userId: userId }, {
      headers: {
        Authorization: jwt,
      },
    })
    .then(() => {
      showQuickToast(`Succesfully redeemed ${selectedMerch}!`, false);
    })
    .catch((err) => {
      console.log(err.response);
      showQuickToast('Woah there, something went wrong! Find dev team please :/', true);
    });
    
  }, [userId]);


  // Handle scan
  useEffect(() => {
    if (qrData == "") {
      console.log("NO QR DATA");
      return;
    }

    if (!selectedMerch) {
      showToast('Please select a merch item to check in attendees for!', true);
      return;
    }

    const jwt = localStorage.getItem("jwt");
    axios
      .post(Config.API_BASE_URL + "/checkin/scan/merch", {qrCode: qrData}, {
        headers: {
          Authorization: jwt,
        },
      })
      .then(function (response) {
        setUserId(response.data);
      });

    // axios
    //   .post(Config.API_BASE_URL + `/attendee/redeemMerch/${selectedMerch}`, { userId: userId }, {
    //     headers: {
    //       Authorization: jwt,
    //     },
    //   })
    //   .then(() => {
    //     showQuickToast(`Succesfully redeemed ${selectedMerch}!`, false);
    //   })
    //   .catch((err) => {
    //     console.log(err.response);
    //     showQuickToast('Woah there, something went wrong! Find dev team please :/', true);
    //   });
    
    setQrData("");
  }, [qrData]);

  // Handle the search as the user types
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);

    // Perform prefix search on attendeeEmails
    if (inputEmail) {
      const filtered = attendeeEmails.filter((attendee) =>
        attendee.email.toLowerCase().startsWith(inputEmail.toLowerCase())
      );
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails([]);
    }
  };

  // Handle selecting an email from the dropdown
  const handleSelectEmail = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setFilteredEmails([]); // Hide the dropdown after selecting
  };

  // Check attendee into event via their email
  const handleCheckin = async () => {
    if (!selectedMerch) {
      showToast('Please select a merch item to check in attendees for!', true);
      return;
    }

    if (!email) {
      showToast('Please enter an email.', true);
      return;
    }

    const selectedAttendee = attendeeEmails.find((attendee) => attendee.email === email);
    if (!selectedAttendee) {
      showToast('This email is not registered as an R|P attendee.', true);
      return;
    }

    const userId = selectedAttendee.userId;
    setUserId(userId);

    const jwt = localStorage.getItem("jwt");
    axios
      .post(Config.API_BASE_URL + `/attendee/redeemMerch/${selectedMerch}`, { userId: userId }, {
        headers: {
          Authorization: jwt,
        },
      })
      .then(function () {
        showQuickToast(`Succesfully redeemed ${selectedMerch}!`, false);
      })
      .catch(function (error) {
        showQuickToast('Could not redeem merch. Please try again.', true);
        console.log(error);
      });
  };


  return <>
    <Box flex="1" minW="90vw" p={4}>
      <Heading size="lg">Merch</Heading>
      <br />
      <Flex>
        {/* Left Side: Webcam or Email input */}
        <Box flex="1" p={4} mr={4}>
          <FormControl display="flex" alignItems="center" mb={4} mt="0)">
            <FormLabel htmlFor="toggle-webcam" mb="0">
              Show Webcam
            </FormLabel>
            <Switch
              id="toggle-webcam"
              isChecked={showWebcam}
              onChange={() => setShowWebcam(!showWebcam)}
            />
          </FormControl>

          {showWebcam ? (
            <Box>
              <Scanner allowMultiple={true} styles={{}} onScan={(result) => {
                setQrData(result[0].rawValue);
              }} />;
            </ Box>
          ) : (
            <FormControl>
              <FormLabel htmlFor="email">Enter Attendee Email</FormLabel>
              <Input
                id="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                autoComplete="off"
              />

              {filteredEmails.length > 0 && (
                <Box
                  mt={1}
                  border="1px solid #ccc"
                  borderRadius="md"
                  maxH="200px"
                  overflowY="auto"
                  position="absolute"
                  width="100%"
                  bg="white"
                  zIndex={10}
                >
                  <List>
                    {filteredEmails.map((attendee) => (
                      <ListItem
                        key={attendee.userId}
                        p={2}
                        _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                        onClick={() => handleSelectEmail(attendee.email)}
                        color='black'
                      >
                        {attendee.email}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Button mt={4} colorScheme="blue" onClick={handleCheckin}>
                Check in Attendee
              </Button>

            </FormControl>
          )}
        </Box>

        {/* Right Side: Event Selection */}
        <Box flex="1" p={4}>
          <FormControl>
            <FormLabel textAlign="center" fontWeight="bold" fontSize="xl">
              Merch
            </FormLabel>

            <RadioGroup onChange={(value) => setSelectedMerch(value)} value={selectedMerch}>
              <Radio value="Tshirt" p={2} border="1px solid #ccc" borderRadius="md" mb={2}>
                T-shirt
              </Radio>

              <Radio value="Button" p={2} border="1px solid #ccc" borderRadius="md" mb={2}>
                Button
              </Radio>

              <Radio value="Tote" p={2} border="1px solid #ccc" borderRadius="md" mb={2}>
                Tote Bag
              </Radio>

              <Radio value="Cap" p={2} border="1px solid #ccc" borderRadius="md">
                Cap
              </Radio>
            </RadioGroup>
          </FormControl>
        </Box>
      </Flex >
    </Box >
  </>;
}

export default EventCheckin;
