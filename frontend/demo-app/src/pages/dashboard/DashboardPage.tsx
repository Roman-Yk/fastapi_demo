import React from 'react';
import { Container, Title, Text, Stack, Grid, Paper, Group, Button } from '@mantine/core';
import { IconTruck, IconClipboardList, IconPlus, IconChartBar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container size="xl" px="xl" py="sm">
      <Stack gap="lg">
        {/* Header */}
        <Stack gap="xs">
          <Title order={1}>Dashboard</Title>
          <Text c="dimmed">Welcome to your FastAPI Demo application</Text>
        </Stack>

        {/* Quick Actions */}
        <Paper withBorder p="lg">
          <Stack gap="md">
            <Title order={3}>Quick Actions</Title>
            <Group>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate('/orders/create')}
              >
                Create Order
              </Button>
              <Button
                variant="light"
                leftSection={<IconClipboardList size={16} />}
                onClick={() => navigate('/')}
              >
                View Orders
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Stats Grid */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper withBorder p="lg" style={{ height: '120px' }}>
              <Group>
                <IconTruck size={32} color="var(--mantine-color-blue-6)" />
                <Stack gap={0}>
                  <Text size="xl" fw={700}>42</Text>
                  <Text size="sm" c="dimmed">Active Orders</Text>
                </Stack>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper withBorder p="lg" style={{ height: '120px' }}>
              <Group>
                <IconClipboardList size={32} color="var(--mantine-color-green-6)" />
                <Stack gap={0}>
                  <Text size="xl" fw={700}>128</Text>
                  <Text size="sm" c="dimmed">Total Orders</Text>
                </Stack>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper withBorder p="lg" style={{ height: '120px' }}>
              <Group>
                <IconChartBar size={32} color="var(--mantine-color-orange-6)" />
                <Stack gap={0}>
                  <Text size="xl" fw={700}>85%</Text>
                  <Text size="sm" c="dimmed">Completion Rate</Text>
                </Stack>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper withBorder p="lg" style={{ height: '120px' }}>
              <Group>
                <IconTruck size={32} color="var(--mantine-color-red-6)" />
                <Stack gap={0}>
                  <Text size="xl" fw={700}>7</Text>
                  <Text size="sm" c="dimmed">Pending</Text>
                </Stack>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Recent Activity */}
        <Paper withBorder p="lg">
          <Stack gap="md">
            <Title order={3}>Recent Activity</Title>
            <Text c="dimmed">
              Recent activity and notifications will be displayed here.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}; 