import { CloseIcon, CheckIcon } from '@chakra-ui/icons';
import {
  Box,
  Stack,
  Card,
  CardHeader,
  Heading,
  CardBody,
  StackDivider,
  Flex,
  IconButton,
  Input,
  useToast,
  Select,
  Text
} from '@chakra-ui/react';
import api from '../../util/api';
import React, { useCallback } from 'react';

const TEAMS = [
  'CONTENT', 'DEV', 'MARKETING', 'DESIGN', 'OPERATIONS', 'ADMIN'
];

function RolesCard({ role }: { role: string }) {
  const toast = useToast();
  const [nameList, setNameList] = React.useState([]);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [newTeam, setNewTeam] = React.useState('');

  const [firstRender, setFirstRender] = React.useState(true);

  const showToast = (message: string, error: boolean) => {
    toast({
      title: message,
      status: error ? "error" : "success",
      duration: 9000,
      isClosable: true,
    });
  };

  const handleUpdateNewTeam = useCallback((newTeam: string) => {
    setNewTeam(newTeam);
  }, []);

  const getRoles = async () => {
    api.get("/auth/" + role)
      .then(function (response) {
        // handle success
        const names = response.data.map((item: Record<string, string>) => item.email);
        // console.log(names);
        setNameList(names);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });

  };

  React.useEffect(() => {
    if (firstRender) {
      console.log("in here!");
      setFirstRender(false);
      getRoles();
    }
  }, [firstRender]);

  const removeFromRole = async (role: string, email: string) => {    
    try {
      const response = await api.delete('/auth/', {
        data: {
          email,
          role
        }
      });

      console.log('User role updated:', response.data);
      showToast(email+' User Role updated: No longer '+role+' role', false);
      getRoles();
    } catch (error) {
      console.log(error);
      showToast('Failed to update user role. Try again soon!', true);
    }
  };

  const removeFromStaff = async (email: string) => {
    const userId = generateUserId(email);
    try {
      await api.delete(`/staff/${userId}`);
      console.log('Staff record removed');
    } catch (error) {
      console.error('Failed to remove staff record:', error);
    }
  };

  const updateUserTeam = async (name: string, newTeam: string) => {
    console.log('Update user team:', name, newTeam);
    // TODO: Connect to API
  };

  const renderNamesWithButtons = (role: string, names: string[]) => {
    return names.map((name) => (
      <Flex key={name} justifyContent="space-between" alignItems="center">
        <Box flex={1} mr={7}>
          <Text textAlign={"left"}>{name}</Text>
        </Box>
        <Select
          flex={1}
          placeholder="Select team"
          value={''}
          onChange={(e) => {
            const selectedTeam = e.target.value;
            if (selectedTeam !== '') {
              updateUserTeam(name, selectedTeam);
            }
          }}
          mr={2}
        >
          {TEAMS.map((team) => (
            <option key={team} value={team}>{toTitleCase(team)}</option>
          ))}
        </Select>
        <IconButton
          size={'md'}
          icon={ <CloseIcon /> }
          aria-label={'Open Menu'}
          onClick={async () => {
            await removeFromRole(role, name);
            await removeFromStaff(name);
          }}
        />
      </Flex>
    ));
  };

  const addToRole = async ( email: string) => {    
    try {
      const response = await api.put('/auth/', {
        email,
        role
      });

      console.log('User role updated:', response.data);
      showToast(email+' User Role updated: Now '+role+' role', false);
    } catch (error) {
      console.log(error);
      showToast('Failed to update user role. Try again soon!', true);
    }
  };

  const generateUserId = (email: string): string => {
    return email.split('@')[0].toLowerCase();
  };

  const addToStaff = async (name: string, email: string, team: string) => {
    const userId = generateUserId(email);
    console.log('Adding staff:', { userId, name, team });
    try {
      const response = await api.post('/staff/', {
        userId,
        name,
        team
      });
  
      console.log('Staff added:', response.data);
    } catch (error) {
      console.error('Failed to add staff:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!email || !name || !newTeam) {
      showToast('Please provide name, email, and team.', true);
      return;
    }
    try {
      await addToRole(email);
      await addToStaff(name, email, newTeam);
      showToast(`${email} added to role and staff`, false);
      setEmail('');
      setName('');
      setNewTeam('');
      await getRoles();
    } catch (error) {
      console.error(error);
      showToast('Failed to add staff member. Try again soon!', true);
    }
  };

  function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

  return (
    <Card overflowY="auto" maxHeight="70vh">
      <CardHeader>
        <Heading size='md'>{toTitleCase(role)}</Heading>
      </CardHeader>
      <CardBody>
        <Flex mb={4}>
          <Input
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            mr={2}
          />
          <Input
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            mr={2}
          />
          <Select
            placeholder="Select team"
            value={newTeam}
            onChange={(e) => handleUpdateNewTeam(e.target.value)}
            mr={2}
          >
            {TEAMS.map((team) => (
              <option key={team} value={team}>{toTitleCase(team)}</option>
            ))}
          </Select>

          <IconButton
            size={'md'}
            icon={<CheckIcon />}
            aria-label={'Open Menu'}
            onClick={handleSubmit}
          />
        </Flex>
        <Stack divider={<StackDivider />} spacing='4'>
          {renderNamesWithButtons(role, nameList)}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default RolesCard;
