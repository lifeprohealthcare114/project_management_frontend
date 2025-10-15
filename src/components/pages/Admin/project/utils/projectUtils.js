import { CheckCircle, AccessTime, Warning } from "@mui/icons-material";

export const getTimelineStatus = (startDate, endDate, status) => {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (status === "Completed") {
    return { label: "Completed", color: "success", icon: <CheckCircle /> };
  }

  if (today > end) {
    return { label: "Overdue", color: "error", icon: <Warning /> };
  }

  if (today < start) {
    return { label: "Not Started", color: "default", icon: <AccessTime /> };
  }

  const totalDuration = end - start;
  const elapsed = today - start;
  const percentElapsed = (elapsed / totalDuration) * 100;

  if (percentElapsed < 50) {
    return { label: "On Track", color: "success", icon: <CheckCircle /> };
  } else if (percentElapsed < 80) {
    return { label: "In Progress", color: "info", icon: <AccessTime /> };
  } else {
    return { label: "Near Deadline", color: "warning", icon: <Warning /> };
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "success";
    case "In Progress":
      return "info";
    case "Planning":
      return "warning";
    default:
      return "default";
  }
};
