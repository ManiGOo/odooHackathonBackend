/**
 * Determine if an expense is approved based on rules
 * @param {Array} approvals Array of approver decisions: { approverId, approved: true/false }
 * @param {Object} rule Approval rule configuration
 */
export const checkApprovalStatus = (approvals, rule) => {
  // Rule example:
  // { type: "percentage", threshold: 0.6 } OR { type: "specific", approverId: "CFO_ID" }

  if (!approvals.length) return "Pending";

  if (rule.type === "percentage") {
    const approvedCount = approvals.filter((a) => a.approved).length;
    const percent = approvedCount / approvals.length;
    return percent >= rule.threshold ? "Approved" : "Pending";
  }

  if (rule.type === "specific") {
    const found = approvals.find((a) => a.approverId === rule.approverId && a.approved);
    return found ? "Approved" : "Pending";
  }

  // hybrid or default
  return "Pending";
};

/**
 * Returns next approver in the sequence
 */
export const getNextApprover = (approvers, currentIndex) => {
  if (!approvers || currentIndex === undefined) return null;
  return approvers[currentIndex + 1] || null;
};
