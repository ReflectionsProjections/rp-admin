import { Box, Flex, Heading, useMediaQuery, Text } from "@chakra-ui/react";
import CustomDropdown from "../../components/CustomDropdown";

function Notifications() {
  const [isSmall] = useMediaQuery("(max-width: 800px)");

  const staff = [
    {
      name: "Ronit Anandani",
      team: "dev",
      present: true,
    },
    {
      name: "Aryan Bahl",
      team: "design",
      present: false,
    },
  ];

  const meetingDates = ["3/10", "3/17", "3/24", "3/29"];
  const teams = ["Full Team", "Dev", "Design"];

  return (
    <Box flex="1" minW="90vw" p={4}>
      <Heading size="lg" mb={4}>
        Attendance
      </Heading>
      {isSmall ? (
        <>
          <Flex mb={6} flexWrap="wrap" gap={3}>
            <CustomDropdown dropdownOptions={teams} />
            <CustomDropdown dropdownOptions={meetingDates} />
          </Flex>
          <Box>
            {staff.map((member, index) => (
              <Flex
                key={member.name}
                justify="space-between"
                align="center"
                py={4}
                borderBottom={
                  index < staff.length - 1 ? "1px solid #eee" : "none"
                }
              >
                <Text fontSize="xl" fontWeight="bold">
                  {member.name}
                </Text>
                <Box
                  bg="#EAEAEA"
                  borderRadius="md"
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="80px"
                >
                  <Box
                    width="20px"
                    height="20px"
                    borderRadius="full"
                    bg={member.present ? "green.500" : "red.500"}
                    mr={2}
                  />
                  <Box as="span" transform="translateY(2px)">
                    ▼
                  </Box>
                </Box>
              </Flex>
            ))}
          </Box>
        </>
      ) : (
        <></>
      )}
    </Box>
  );
}

export default Notifications;
