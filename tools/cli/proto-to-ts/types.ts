export type FileDescriptor = {
  filename: string;
  outDir: string;
  content: string;
};

export type ProtoOptionsField = {
  optional?: boolean
}

export type ProtoTypeField = {
  type: string | ProtoTypeField;
  rule?: 'repeated';
  options?: ProtoOptionsField;
};

export type ProtoType = {
  [key: string]: {
    fields: {
      [key: string]: ProtoTypeField;
    };
  };
};

export type MappedProtoType = {
  [key: string]: string | ProtoType;
};

export type ProtoPackage = {
  [key: string]: ProtoService | ProtoType;
};

export type ProtoMethod = {
  requestType: string;
  responseType: string;
  responseStream?: boolean;
};

export type ProtoMethodTuple = [string, ProtoMethod];

export type ProtoService = {
  methods: {
    [key: string]: ProtoMethod;
  };
};
