export const unathorized = () => ({
  payload: 'No access to perform this action',
  type: 'error',
});

export const internalError = () => ({
  payload: 'Unexpected internal error occured',
  type: 'error',
});
