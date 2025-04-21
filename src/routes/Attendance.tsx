import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Heading,
  useToast,
  Center,
  Spinner,
  Text,
} from "@chakra-ui/react";
import Lottie from "lottie-react";
import successAnimation from "../assets/animations/success.json";
import api from "../util/api";
import axios from "axios";

type Status =
  | "loading"
  | "success"
  | "alreadyCheckedIn"
  | "clientError"
  | "serverError";

const AttendancePage = () => {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get("meetingId");

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const checkInToMeeting = async () => {
      if (!meetingId) {
        toast({
          title: "Missing Meeting ID",
          description: "No meeting ID provided in the URL.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setStatus("clientError");
        return;
      }
  
      try {
        const res = await api.post("/staff/check-in", { meetingId });
        
        if (res.status === 200) {
          toast({
            title: "Attendance Marked",
            description: "You have been checked into the meeting.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setStatus("success");
          return;
        }
        
        console.log("Check-in response:", res);
        const { error: code, message: msg } = res.response.data as {
          error?: string;
          message?: string;
        };
        
        if (res.status === 400) {
          if (code === "AlreadyCheckedIn") {
            toast({
              title: "Already Checked In",
              description: msg ?? "You're already checked into this meeting!",
              status: "info",
              duration: 5000,
              isClosable: true,
            });
            setStatus("alreadyCheckedIn");
            return;
          }
  
          toast({
            title: code ?? "Could Not Check In",
            description: msg ?? "Please check your data and try again.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          setErrorMessage(msg ?? "Client error");
          setStatus("clientError");
          return;
        }
  
        if (res.status >= 500) {
          toast({
            title: "Server Error",
            description: msg ?? "Please try again later or contact an admin.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setErrorMessage(msg ?? "Server error");
          setStatus("serverError");
          return;
        }
  
        // fallback
        toast({
          title: "Unexpected Response",
          description: msg ?? "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setErrorMessage(msg ?? "Unexpected response");
        setStatus("serverError");
      } catch (err) {
        console.error("Check-in failed:", err);
        if (axios.isAxiosError(err) && err.response?.data) {
          // Pull these off err.response.data
          const { error: code, message: msg } = err.response.data as {
            error?: string;
            message?: string;
          };
  
          toast({
            title: code ?? "Network Error",
            description: msg ?? err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setErrorMessage(msg ?? err.message);
          setStatus("serverError");
        } else {
          const message = (err as Error).message;
          toast({
            title: "Unexpected Error",
            description: message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setErrorMessage(message);
          setStatus("serverError");
        }
      }
    };
  
    checkInToMeeting();
  }, [meetingId, toast]);

  return (
    <Center padding={8} minHeight="100vh">
      {status === "loading" && (
        <Box textAlign="center">
          <Heading size="md">Checking you in…</Heading>
          <Spinner mt={4} />
        </Box>
      )}

      {status === "success" && (
        <Box textAlign="center">
          <Lottie
            animationData={successAnimation}
            loop={false}
            style={{ height: 200 }}
          />
          <Heading mt={4}>You're all checked in ✅</Heading>
        </Box>
      )}

      {status === "alreadyCheckedIn" && (
        <Box textAlign="center">
          <Heading size="md">You already checked in 👀</Heading>
          <Text mt={2}>No need to worry, you're counted.</Text>
        </Box>
      )}

      {(status === "clientError" || status === "serverError") && (
        <Box textAlign="center">
          <Heading size="md" color="red.500">
            {status === "clientError"
              ? "Could Not Check In"
              : "Check‑in Failed"}
          </Heading>
          <Text mt={2}>
            {errorMessage || "Please try again or contact an admin."}
          </Text>
        </Box>
      )}
    </Center>
  );
};

export default AttendancePage;