var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod,
  )
);
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@aws-amplify/platform-core/lib/backend_identifier_conversions.js
var require_backend_identifier_conversions = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/backend_identifier_conversions.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BackendIdentifierConversions = void 0;
    var crypto_1 = require("crypto");
    var STACK_NAME_LENGTH_LIMIT = 128;
    var AMPLIFY_PREFIX = "amplify";
    var HASH_LENGTH = 10;
    var NUM_DASHES = 4;
    var BackendIdentifierConversions = class {
      /**
       * Convert a stack name to a BackendIdentifier
       *
       * If the stack name is ambiguous, undefined is returned
       */
      // It's fine to ignore the rule here because the anti-static rule is to ban the static function which should use constructor
      // eslint-disable-next-line no-restricted-syntax
      static fromStackName(stackName) {
        if (!stackName) {
          return;
        }
        const parts = stackName.split("-");
        if (parts.length !== 5) {
          return;
        }
        const [prefix, namespace, instance, type, hash] = parts;
        if (prefix !== AMPLIFY_PREFIX) {
          return;
        }
        if (type !== "sandbox" && type !== "branch") {
          return;
        }
        return {
          namespace,
          name: instance,
          type,
          hash,
        };
      }
      /**
       * Convert a BackendIdentifier to a stack name.
       *
       * !!!DANGER!!!
       * !!!DO NOT CHANGE THIS UNLESS YOU ARE 100% SURE YOU UNDERSTAND THE CONSEQUENCES!!!
       *
       * Changing this method will change how stack names are generated which could be a massive breaking change for existing Amplify stacks.
       */
      // It's fine to ignore the rule here because the anti-static rule is to ban the static function which should use constructor
      // eslint-disable-next-line no-restricted-syntax
      static toStackName(backendId) {
        const hash = getHash(backendId);
        const name = sanitizeChars(backendId.name).slice(0, 50);
        const namespaceMaxLength =
          STACK_NAME_LENGTH_LIMIT -
          AMPLIFY_PREFIX.length -
          backendId.type.length -
          name.length -
          NUM_DASHES -
          HASH_LENGTH;
        const namespace = sanitizeChars(backendId.namespace).slice(
          0,
          namespaceMaxLength - 1,
        );
        return ["amplify", namespace, name, backendId.type, hash].join("-");
      }
    };
    exports2.BackendIdentifierConversions = BackendIdentifierConversions;
    var getHash = (backendId) =>
      backendId.hash ?? // md5 would be sufficient here because this hash does not need to be cryptographically secure, but this ensures that we don't get unnecessarily flagged by some security scanner
      (0, crypto_1.createHash)("sha512")
        .update(backendId.namespace)
        .update(backendId.name)
        .digest("hex")
        .slice(0, HASH_LENGTH);
    var sanitizeChars = (str) => {
      return str.replace(/[^A-Za-z0-9]/g, "");
    };
  },
});

// node_modules/@aws-amplify/platform-core/lib/errors/amplify_error.js
var require_amplify_error = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/errors/amplify_error.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AmplifyError = void 0;
    var _1 = require_errors();
    var AmplifyError = class _AmplifyError extends Error {
      name;
      classification;
      options;
      cause;
      serializedError;
      message;
      resolution;
      details;
      link;
      code;
      /**
       * You should use AmplifyUserError or AmplifyLibraryFault to throw an error.
       * @param name - a user friendly name for the exception
       * @param classification - LibraryFault or UserError
       * @param options - error stack, resolution steps, details, or help links
       * @param cause If you are throwing this exception from within a catch block,
       * you must provide the exception that was caught.
       * @example
       * try {
       *  ...
       * } catch (error){
       *    throw new AmplifyError(...,...,error);
       * }
       */
      constructor(name, classification, options, cause) {
        super(options.message, { cause });
        this.name = name;
        this.classification = classification;
        this.options = options;
        this.cause = cause;
        Object.setPrototypeOf(this, _AmplifyError.prototype);
        this.message = options.message;
        this.details = options.details;
        this.resolution = options.resolution;
        this.code = options.code;
        this.link = options.link;
        if (cause && _AmplifyError.isAmplifyError(cause)) {
          cause.serializedError = void 0;
        }
        this.serializedError = Buffer.from(
          JSON.stringify(
            {
              name,
              classification,
              options,
              cause,
            },
            errorSerializer,
          ),
        ).toString("base64");
      }
      static fromStderr = (_stderr) => {
        try {
          const serializedString = tryFindSerializedErrorJSONString(_stderr);
          if (!serializedString) {
            return void 0;
          }
          const { name, classification, options, cause } =
            JSON.parse(serializedString);
          let serializedCause = cause;
          if (
            cause &&
            ErrorSerializerDeserializer.isSerializedErrorType(cause)
          ) {
            serializedCause = ErrorSerializerDeserializer.deserialize(cause);
          }
          return classification === "ERROR"
            ? new _1.AmplifyUserError(name, options, serializedCause)
            : new _1.AmplifyFault(name, options, serializedCause);
        } catch {
          return void 0;
        }
      };
      /**
       * This function is a type predicate for AmplifyError.
       * See https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates.
       *
       * Checks if error is an AmplifyError by inspecting if required properties are set.
       * This is recommended instead of instanceof operator.
       * The instance of operator does not work as expected if AmplifyError class is loaded
       * from multiple sources, for example when package manager decides to not de-duplicate dependencies.
       * See https://github.com/nodejs/node/issues/17943.
       */
      static isAmplifyError = (error) => {
        return (
          error instanceof Error &&
          "classification" in error &&
          (error.classification === "ERROR" ||
            error.classification === "FAULT") &&
          typeof error.name === "string" &&
          typeof error.message === "string"
        );
      };
      static fromError = (error) => {
        if (_AmplifyError.isAmplifyError(error)) {
          return error;
        }
        const errorMessage =
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "An unknown error happened. Check downstream error";
        if (error instanceof Error && isCredentialsError(error)) {
          return new _1.AmplifyUserError(
            "CredentialsError",
            {
              message: errorMessage,
              resolution:
                "Ensure your AWS credentials are correctly set and refreshed.",
            },
            error,
          );
        }
        if (error instanceof Error && isRequestSignatureError(error)) {
          return new _1.AmplifyUserError(
            "RequestSignatureError",
            {
              message: errorMessage,
              resolution:
                "You can retry your last request, check if your system time is synchronized (clock skew) or ensure your AWS credentials are correctly set and refreshed.",
            },
            error,
          );
        }
        if (error instanceof Error && isYargsValidationError(error)) {
          return new _1.AmplifyUserError(
            "InvalidCommandInputError",
            {
              message: errorMessage,
              resolution:
                "Please see the underlying error message for resolution.",
            },
            error,
          );
        }
        if (error instanceof Error && isENotFoundError(error)) {
          return new _1.AmplifyUserError(
            "DomainNotFoundError",
            {
              message: "Unable to establish a connection to a domain",
              resolution:
                "Ensure domain name is correct and network connection is stable.",
            },
            error,
          );
        }
        if (error instanceof Error && isSyntaxError(error)) {
          return new _1.AmplifyUserError(
            "SyntaxError",
            {
              message: error.message,
              resolution:
                "Check your backend definition in the `amplify` folder for syntax and type errors.",
            },
            error,
          );
        }
        if (error instanceof Error && isInsufficientDiskSpaceError(error)) {
          return new _1.AmplifyUserError(
            "InsufficientDiskSpaceError",
            {
              message: error.message,
              resolution:
                "There appears to be insufficient space on your system to finish. Clear up some disk space and try again.",
            },
            error,
          );
        }
        if (error instanceof Error && isOutOfMemoryError(error)) {
          return new _1.AmplifyUserError(
            "InsufficientMemorySpaceError",
            {
              message: error.message,
              resolution:
                "There appears to be insufficient memory on your system to finish. Close other applications or restart your system and try again.",
            },
            error,
          );
        }
        if (error instanceof Error && isInotifyError(error)) {
          return new _1.AmplifyUserError(
            "InsufficientInotifyWatchersError",
            {
              message: error.message,
              resolution:
                "There appears to be an insufficient number of inotify watchers. To increase the amount of inotify watchers, change the `fs.inotify.max_user_watches` setting in your system config files to a higher value.",
            },
            error,
          );
        }
        return new _1.AmplifyFault(
          "UnknownFault",
          {
            message: errorMessage,
          },
          error instanceof Error ? error : new Error(String(error)),
        );
      };
    };
    exports2.AmplifyError = AmplifyError;
    var tryFindSerializedErrorJSONString = (_stderr) => {
      let errorJSONString = tryFindSerializedErrorJSONStringV2(_stderr);
      if (!errorJSONString) {
        errorJSONString = tryFindSerializedErrorJSONStringV1(_stderr);
      }
      return errorJSONString;
    };
    var tryFindSerializedErrorJSONStringV2 = (_stderr) => {
      const extractionRegex =
        /["']?serializedError["']?:[ ]?(?:`([a-zA-Z0-9+/=]+?)`|'([a-zA-Z0-9+/=]+?)'|"([a-zA-Z0-9+/=]+?)")/;
      const serialized = _stderr.match(extractionRegex);
      if (serialized && serialized.length === 4) {
        const base64SerializedString = serialized
          .slice(1)
          .find((item) => item && item.length > 0);
        if (base64SerializedString) {
          return Buffer.from(base64SerializedString, "base64").toString(
            "utf-8",
          );
        }
      }
      return void 0;
    };
    var tryFindSerializedErrorJSONStringV1 = (_stderr) => {
      const extractionRegex =
        /["']?serializedError["']?:[ ]?(?:`(.+?)`|'(.+?)'|"((?:\\"|[^"])*?)")/;
      const serialized = _stderr.match(extractionRegex);
      if (serialized && serialized.length === 4) {
        return serialized
          .slice(1)
          .find((item) => item && item.length > 0)
          ?.replaceAll('\\"', '"')
          .replaceAll("\\'", "'");
      }
      return void 0;
    };
    var isCredentialsError = (err) => {
      return (
        !!err &&
        [
          "ExpiredToken",
          "ExpiredTokenException",
          "CredentialsProviderError",
          "InvalidClientTokenId",
          "CredentialsError",
        ].includes(err.name)
      );
    };
    var isRequestSignatureError = (err) => {
      return (
        !!err &&
        ["InvalidSignatureException", "SignatureDoesNotMatch"].includes(
          err.name,
        )
      );
    };
    var isYargsValidationError = (err) => {
      return (
        !!err &&
        ([
          "Unknown command",
          "Unknown argument",
          "Did you mean",
          "Not enough non-option arguments",
          "Too many non-option arguments",
          "Missing required argument",
          "Invalid values:",
          "Missing dependent arguments",
          "Implications failed",
        ].some((message) => err.message.startsWith(message)) ||
          err.message.endsWith("are mutually exclusive"))
      );
    };
    var isENotFoundError = (err) => {
      return !!err && err.message.includes("getaddrinfo ENOTFOUND");
    };
    var isSyntaxError = (err) => {
      return !!err && err.name === "SyntaxError";
    };
    var isInsufficientDiskSpaceError = (err) => {
      return (
        !!err &&
        ["ENOSPC: no space left on device", "code ENOSPC"].some((message) =>
          err.message.includes(message),
        )
      );
    };
    var isOutOfMemoryError = (err) => {
      return (
        !!err &&
        (err.message.includes("process out of memory") ||
          err.message.includes("connect ENOMEM"))
      );
    };
    var isInotifyError = (err) => {
      return !!err && err.message.includes("inotify_add_watch");
    };
    var errorSerializer = (_, value) => {
      if (value instanceof Error) {
        return ErrorSerializerDeserializer.serialize(value);
      }
      return value;
    };
    var ErrorSerializerDeserializer = class {
      static serialize = (error) => {
        const serializedError = {
          name: error.name,
          message: error.message,
        };
        return serializedError;
      };
      static deserialize = (deserialized) => {
        const error = new Error(deserialized.message);
        error.name = deserialized.name;
        return error;
      };
      static isSerializedErrorType = (obj) => {
        if (obj && obj.name && obj.message) return true;
        return false;
      };
    };
  },
});

// node_modules/@aws-amplify/platform-core/lib/errors/amplify_user_error.js
var require_amplify_user_error = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/errors/amplify_user_error.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AmplifyUserError = void 0;
    var amplify_error_1 = require_amplify_error();
    var AmplifyUserError2 = class extends amplify_error_1.AmplifyError {
      /**
       * Create a new Amplify Error.
       * @param name - a user friendly name for the user error
       * @param options - error stack, resolution steps, details, or help links
       * @param cause If you are throwing this error from within a catch block,
       * you must provide the error that was caught.
       * @example
       * try {
       *  ...
       * } catch (error){
       *    throw new AmplifyError(...,...,error);
       * }
       */
      constructor(name, options, cause) {
        super(name, "ERROR", options, cause);
      }
    };
    exports2.AmplifyUserError = AmplifyUserError2;
  },
});

// node_modules/@aws-amplify/platform-core/lib/errors/amplify_library_fault.js
var require_amplify_library_fault = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/errors/amplify_library_fault.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AmplifyFault = void 0;
    var amplify_error_1 = require_amplify_error();
    var AmplifyFault2 = class extends amplify_error_1.AmplifyError {
      /**
       * Create a new Amplify Library Fault
       * @param name - a user friendly name for the exception
       * @param options - error stack, resolution steps, details, or help links
       * @param cause If you are throwing this exception from within a catch block,
       * you must provide the exception that was caught.
       * @example
       * try {
       *  ...
       * } catch (error){
       *    throw new AmplifyLibraryFault(error,...,...);
       * }
       */
      constructor(name, options, cause) {
        super(name, "FAULT", options, cause);
      }
    };
    exports2.AmplifyFault = AmplifyFault2;
  },
});

// node_modules/@aws-amplify/platform-core/lib/errors/index.js
var require_errors = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/errors/index.js"(exports2) {
    "use strict";
    var __createBinding =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __exportStar =
      (exports2 && exports2.__exportStar) ||
      function (m, exports3) {
        for (var p in m)
          if (
            p !== "default" &&
            !Object.prototype.hasOwnProperty.call(exports3, p)
          )
            __createBinding(exports3, m, p);
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_amplify_error(), exports2);
    __exportStar(require_amplify_user_error(), exports2);
    __exportStar(require_amplify_library_fault(), exports2);
  },
});

// node_modules/@aws-amplify/platform-core/lib/backend_entry_point_locator.js
var require_backend_entry_point_locator = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/backend_entry_point_locator.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BackendLocator = void 0;
    var fs_1 = __importDefault(require("fs"));
    var path_1 = __importDefault(require("path"));
    var errors_1 = require_errors();
    var BackendLocator = class {
      rootDir;
      relativePath = path_1.default.join("amplify", "backend");
      // Give preference to JS if that exists over TS in case customers have their own compilation process.
      supportedFileExtensions = [".js", ".mjs", ".cjs", ".ts"];
      /**
       * Constructor for BackendLocator
       */
      constructor(rootDir = process.cwd()) {
        this.rootDir = rootDir;
      }
      locate = () => {
        for (const fileExtension of this.supportedFileExtensions) {
          if (
            fs_1.default.existsSync(
              path_1.default.resolve(
                this.rootDir,
                this.relativePath + fileExtension,
              ),
            )
          ) {
            return this.relativePath + fileExtension;
          }
        }
        throw new errors_1.AmplifyUserError("FileConventionError", {
          message: `Amplify Backend not found in ${this.rootDir}.`,
          resolution:
            "Amplify Backend must be defined in amplify/backend.(ts|js|cjs|mjs)",
        });
      };
    };
    exports2.BackendLocator = BackendLocator;
  },
});

// node_modules/@aws-amplify/platform-core/lib/extract_file_path_from_stack_trace_line.js
var require_extract_file_path_from_stack_trace_line = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/extract_file_path_from_stack_trace_line.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FilePathExtractor = void 0;
    var node_url_1 = require("node:url");
    var extractFilePathFromStackTraceLineRegexes = [
      /\((?<filepath>(\w:)?[^:]*)[:\d]*\)/,
      /at (?<filepath>.*\.\w[^:\d]*)[:\d]*/,
    ];
    var FilePathExtractor = class {
      stackTraceLine;
      /**
       * Constructor for FilePathExtractor
       */
      constructor(stackTraceLine) {
        this.stackTraceLine = stackTraceLine;
      }
      extract = () => {
        for (const regex of extractFilePathFromStackTraceLineRegexes) {
          const match = this.stackTraceLine.match(regex);
          if (match?.groups?.filepath) {
            return this.standardizePath(match?.groups?.filepath);
          }
        }
        return void 0;
      };
      // The input can be either a file path or a file URL. If it's a file URL, convert it to the path.
      standardizePath = (maybeUrl) => {
        try {
          const url = new URL(maybeUrl);
          if (url.protocol === "file:") {
            return (0, node_url_1.fileURLToPath)(url);
          }
          return maybeUrl;
        } catch {
          return maybeUrl;
        }
      };
    };
    exports2.FilePathExtractor = FilePathExtractor;
  },
});

// node_modules/@aws-amplify/platform-core/lib/caller_directory_extractor.js
var require_caller_directory_extractor = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/caller_directory_extractor.js"(
    exports2,
  ) {
    "use strict";
    var __createBinding =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (exports2 && exports2.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
            o["default"] = v;
          });
    var __importStar =
      (exports2 && exports2.__importStar) ||
      /* @__PURE__ */ (function () {
        var ownKeys = function (o) {
          ownKeys =
            Object.getOwnPropertyNames ||
            function (o2) {
              var ar = [];
              for (var k in o2)
                if (Object.prototype.hasOwnProperty.call(o2, k))
                  ar[ar.length] = k;
              return ar;
            };
          return ownKeys(o);
        };
        return function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++)
              if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CallerDirectoryExtractor = void 0;
    var path_1 = __importDefault(require("path"));
    var os = __importStar(require("os"));
    var extract_file_path_from_stack_trace_line_1 =
      require_extract_file_path_from_stack_trace_line();
    var CallerDirectoryExtractor = class {
      stackTrace;
      /**
       * Creates caller directory extractor.
       */
      constructor(stackTrace) {
        this.stackTrace = stackTrace;
      }
      extract = () => {
        let stackTrace = this.stackTrace;
        const unresolvedImportLocationError = new Error(
          "Could not determine import path to construct absolute code path from relative path. Consider using an absolute path instead.",
        );
        if (!stackTrace) {
          throw unresolvedImportLocationError;
        }
        stackTrace = stackTrace.replaceAll(os.EOL, "\n");
        const stacktraceLines =
          stackTrace
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("at")) || [];
        if (stacktraceLines.length < 2) {
          throw unresolvedImportLocationError;
        }
        const stackTraceImportLine = stacktraceLines[1];
        const filePath =
          new extract_file_path_from_stack_trace_line_1.FilePathExtractor(
            stackTraceImportLine,
          ).extract();
        if (filePath) {
          return path_1.default.dirname(filePath);
        }
        throw unresolvedImportLocationError;
      };
    };
    exports2.CallerDirectoryExtractor = CallerDirectoryExtractor;
  },
});

// node_modules/zod/lib/helpers/util.js
var require_util = __commonJS({
  "node_modules/zod/lib/helpers/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getParsedType =
      exports2.ZodParsedType =
      exports2.objectUtil =
      exports2.util =
        void 0;
    var util;
    (function (util2) {
      util2.assertEqual = (val) => val;
      function assertIs(_arg) {}
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2
          .objectKeys(obj)
          .filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function (e) {
          return obj[e];
        });
      };
      util2.objectKeys =
        typeof Object.keys === "function"
          ? (obj) => Object.keys(obj)
          : (object) => {
              const keys = [];
              for (const key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                  keys.push(key);
                }
              }
              return keys;
            };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item)) return item;
        }
        return void 0;
      };
      util2.isInteger =
        typeof Number.isInteger === "function"
          ? (val) => Number.isInteger(val)
          : (val) =>
              typeof val === "number" &&
              isFinite(val) &&
              Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array
          .map((val) => (typeof val === "string" ? `'${val}'` : val))
          .join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (exports2.util = util = {}));
    var objectUtil;
    (function (objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second,
          // second overwrites first
        };
      };
    })(objectUtil || (exports2.objectUtil = objectUtil = {}));
    exports2.ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set",
    ]);
    var getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return exports2.ZodParsedType.undefined;
        case "string":
          return exports2.ZodParsedType.string;
        case "number":
          return isNaN(data)
            ? exports2.ZodParsedType.nan
            : exports2.ZodParsedType.number;
        case "boolean":
          return exports2.ZodParsedType.boolean;
        case "function":
          return exports2.ZodParsedType.function;
        case "bigint":
          return exports2.ZodParsedType.bigint;
        case "symbol":
          return exports2.ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return exports2.ZodParsedType.array;
          }
          if (data === null) {
            return exports2.ZodParsedType.null;
          }
          if (
            data.then &&
            typeof data.then === "function" &&
            data.catch &&
            typeof data.catch === "function"
          ) {
            return exports2.ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return exports2.ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return exports2.ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return exports2.ZodParsedType.date;
          }
          return exports2.ZodParsedType.object;
        default:
          return exports2.ZodParsedType.unknown;
      }
    };
    exports2.getParsedType = getParsedType;
  },
});

// node_modules/zod/lib/ZodError.js
var require_ZodError = __commonJS({
  "node_modules/zod/lib/ZodError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ZodError = exports2.quotelessJson = exports2.ZodIssueCode = void 0;
    var util_1 = require_util();
    exports2.ZodIssueCode = util_1.util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite",
    ]);
    var quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    exports2.quotelessJson = quotelessJson;
    var ZodError = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper =
          _mapper ||
          function (issue) {
            return issue.message;
          };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(
          this.issues,
          util_1.util.jsonStringifyReplacer,
          2,
        );
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
            fieldErrors[sub.path[0]].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    exports2.ZodError = ZodError;
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  },
});

// node_modules/zod/lib/locales/en.js
var require_en = __commonJS({
  "node_modules/zod/lib/locales/en.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require_util();
    var ZodError_1 = require_ZodError();
    var errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodError_1.ZodIssueCode.invalid_type:
          if (issue.received === util_1.ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodError_1.ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util_1.util.jsonStringifyReplacer)}`;
          break;
        case ZodError_1.ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util_1.util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodError_1.ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodError_1.ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util_1.util.joinValues(issue.options)}`;
          break;
        case ZodError_1.ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util_1.util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodError_1.ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodError_1.ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodError_1.ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodError_1.ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util_1.util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodError_1.ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else message = "Invalid input";
          break;
        case ZodError_1.ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else message = "Invalid input";
          break;
        case ZodError_1.ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodError_1.ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodError_1.ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodError_1.ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util_1.util.assertNever(issue);
      }
      return { message };
    };
    exports2.default = errorMap;
  },
});

// node_modules/zod/lib/errors.js
var require_errors2 = __commonJS({
  "node_modules/zod/lib/errors.js"(exports2) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getErrorMap =
      exports2.setErrorMap =
      exports2.defaultErrorMap =
        void 0;
    var en_1 = __importDefault(require_en());
    exports2.defaultErrorMap = en_1.default;
    var overrideErrorMap = en_1.default;
    function setErrorMap(map) {
      overrideErrorMap = map;
    }
    exports2.setErrorMap = setErrorMap;
    function getErrorMap() {
      return overrideErrorMap;
    }
    exports2.getErrorMap = getErrorMap;
  },
});

// node_modules/zod/lib/helpers/parseUtil.js
var require_parseUtil = __commonJS({
  "node_modules/zod/lib/helpers/parseUtil.js"(exports2) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isAsync =
      exports2.isValid =
      exports2.isDirty =
      exports2.isAborted =
      exports2.OK =
      exports2.DIRTY =
      exports2.INVALID =
      exports2.ParseStatus =
      exports2.addIssueToContext =
      exports2.EMPTY_PATH =
      exports2.makeIssue =
        void 0;
    var errors_1 = require_errors2();
    var en_1 = __importDefault(require_en());
    var makeIssue = (params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...(issueData.path || [])];
      const fullIssue = {
        ...issueData,
        path: fullPath,
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message,
        };
      }
      let errorMessage = "";
      const maps = errorMaps
        .filter((m) => !!m)
        .slice()
        .reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, {
          data,
          defaultError: errorMessage,
        }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage,
      };
    };
    exports2.makeIssue = makeIssue;
    exports2.EMPTY_PATH = [];
    function addIssueToContext(ctx, issueData) {
      const overrideMap = (0, errors_1.getErrorMap)();
      const issue = (0, exports2.makeIssue)({
        issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          // contextual error map is first priority
          ctx.schemaErrorMap,
          // then schema-bound map if available
          overrideMap,
          // then global override map
          overrideMap === en_1.default ? void 0 : en_1.default,
          // then global default map
        ].filter((x) => !!x),
      });
      ctx.common.issues.push(issue);
    }
    exports2.addIssueToContext = addIssueToContext;
    var ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid") this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted") this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted") return exports2.INVALID;
          if (s.status === "dirty") status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted") return exports2.INVALID;
          if (value.status === "aborted") return exports2.INVALID;
          if (key.status === "dirty") status.dirty();
          if (value.status === "dirty") status.dirty();
          if (
            key.value !== "__proto__" &&
            (typeof value.value !== "undefined" || pair.alwaysSet)
          ) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    exports2.ParseStatus = ParseStatus;
    exports2.INVALID = Object.freeze({
      status: "aborted",
    });
    var DIRTY = (value) => ({ status: "dirty", value });
    exports2.DIRTY = DIRTY;
    var OK = (value) => ({ status: "valid", value });
    exports2.OK = OK;
    var isAborted = (x) => x.status === "aborted";
    exports2.isAborted = isAborted;
    var isDirty = (x) => x.status === "dirty";
    exports2.isDirty = isDirty;
    var isValid = (x) => x.status === "valid";
    exports2.isValid = isValid;
    var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
    exports2.isAsync = isAsync;
  },
});

// node_modules/zod/lib/helpers/typeAliases.js
var require_typeAliases = __commonJS({
  "node_modules/zod/lib/helpers/typeAliases.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  },
});

// node_modules/zod/lib/helpers/errorUtil.js
var require_errorUtil = __commonJS({
  "node_modules/zod/lib/helpers/errorUtil.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.errorUtil = void 0;
    var errorUtil;
    (function (errorUtil2) {
      errorUtil2.errToObj = (message) =>
        typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) =>
        typeof message === "string"
          ? message
          : message === null || message === void 0
            ? void 0
            : message.message;
    })(errorUtil || (exports2.errorUtil = errorUtil = {}));
  },
});

// node_modules/zod/lib/types.js
var require_types = __commonJS({
  "node_modules/zod/lib/types.js"(exports2) {
    "use strict";
    var __classPrivateFieldGet =
      (exports2 && exports2.__classPrivateFieldGet) ||
      function (receiver, state, kind, f) {
        if (kind === "a" && !f)
          throw new TypeError("Private accessor was defined without a getter");
        if (
          typeof state === "function"
            ? receiver !== state || !f
            : !state.has(receiver)
        )
          throw new TypeError(
            "Cannot read private member from an object whose class did not declare it",
          );
        return kind === "m"
          ? f
          : kind === "a"
            ? f.call(receiver)
            : f
              ? f.value
              : state.get(receiver);
      };
    var __classPrivateFieldSet =
      (exports2 && exports2.__classPrivateFieldSet) ||
      function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
          throw new TypeError("Private accessor was defined without a setter");
        if (
          typeof state === "function"
            ? receiver !== state || !f
            : !state.has(receiver)
        )
          throw new TypeError(
            "Cannot write private member to an object whose class did not declare it",
          );
        return (
          kind === "a"
            ? f.call(receiver, value)
            : f
              ? (f.value = value)
              : state.set(receiver, value),
          value
        );
      };
    var _ZodEnum_cache;
    var _ZodNativeEnum_cache;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.boolean =
      exports2.bigint =
      exports2.array =
      exports2.any =
      exports2.coerce =
      exports2.ZodFirstPartyTypeKind =
      exports2.late =
      exports2.ZodSchema =
      exports2.Schema =
      exports2.custom =
      exports2.ZodReadonly =
      exports2.ZodPipeline =
      exports2.ZodBranded =
      exports2.BRAND =
      exports2.ZodNaN =
      exports2.ZodCatch =
      exports2.ZodDefault =
      exports2.ZodNullable =
      exports2.ZodOptional =
      exports2.ZodTransformer =
      exports2.ZodEffects =
      exports2.ZodPromise =
      exports2.ZodNativeEnum =
      exports2.ZodEnum =
      exports2.ZodLiteral =
      exports2.ZodLazy =
      exports2.ZodFunction =
      exports2.ZodSet =
      exports2.ZodMap =
      exports2.ZodRecord =
      exports2.ZodTuple =
      exports2.ZodIntersection =
      exports2.ZodDiscriminatedUnion =
      exports2.ZodUnion =
      exports2.ZodObject =
      exports2.ZodArray =
      exports2.ZodVoid =
      exports2.ZodNever =
      exports2.ZodUnknown =
      exports2.ZodAny =
      exports2.ZodNull =
      exports2.ZodUndefined =
      exports2.ZodSymbol =
      exports2.ZodDate =
      exports2.ZodBoolean =
      exports2.ZodBigInt =
      exports2.ZodNumber =
      exports2.ZodString =
      exports2.datetimeRegex =
      exports2.ZodType =
        void 0;
    exports2.NEVER =
      exports2.void =
      exports2.unknown =
      exports2.union =
      exports2.undefined =
      exports2.tuple =
      exports2.transformer =
      exports2.symbol =
      exports2.string =
      exports2.strictObject =
      exports2.set =
      exports2.record =
      exports2.promise =
      exports2.preprocess =
      exports2.pipeline =
      exports2.ostring =
      exports2.optional =
      exports2.onumber =
      exports2.oboolean =
      exports2.object =
      exports2.number =
      exports2.nullable =
      exports2.null =
      exports2.never =
      exports2.nativeEnum =
      exports2.nan =
      exports2.map =
      exports2.literal =
      exports2.lazy =
      exports2.intersection =
      exports2.instanceof =
      exports2.function =
      exports2.enum =
      exports2.effect =
      exports2.discriminatedUnion =
      exports2.date =
        void 0;
    var errors_1 = require_errors2();
    var errorUtil_1 = require_errorUtil();
    var parseUtil_1 = require_parseUtil();
    var util_1 = require_util();
    var ZodError_1 = require_ZodError();
    var ParseInputLazyPath = class {
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (this._key instanceof Array) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    var handleResult = (ctx, result) => {
      if ((0, parseUtil_1.isValid)(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error) return this._error;
            const error = new ZodError_1.ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          },
        };
      }
    };
    function processCreateParams(params) {
      if (!params) return {};
      const { errorMap, invalid_type_error, required_error, description } =
        params;
      if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(
          `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`,
        );
      }
      if (errorMap) return { errorMap, description };
      const customMap = (iss, ctx) => {
        var _a, _b;
        const { message } = params;
        if (iss.code === "invalid_enum_value") {
          return {
            message:
              message !== null && message !== void 0
                ? message
                : ctx.defaultError,
          };
        }
        if (typeof ctx.data === "undefined") {
          return {
            message:
              (_a =
                message !== null && message !== void 0
                  ? message
                  : required_error) !== null && _a !== void 0
                ? _a
                : ctx.defaultError,
          };
        }
        if (iss.code !== "invalid_type") return { message: ctx.defaultError };
        return {
          message:
            (_b =
              message !== null && message !== void 0
                ? message
                : invalid_type_error) !== null && _b !== void 0
              ? _b
              : ctx.defaultError,
        };
      };
      return { errorMap: customMap, description };
    }
    var ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return (0, util_1.getParsedType)(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return (
          ctx || {
            common: input.parent.common,
            data: input.data,
            parsedType: (0, util_1.getParsedType)(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent,
          }
        );
      }
      _processInputParams(input) {
        return {
          status: new parseUtil_1.ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: (0, util_1.getParsedType)(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent,
          },
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if ((0, parseUtil_1.isAsync)(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success) return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        var _a;
        const ctx = {
          common: {
            issues: [],
            async:
              (_a =
                params === null || params === void 0
                  ? void 0
                  : params.async) !== null && _a !== void 0
                ? _a
                : false,
            contextualErrorMap:
              params === null || params === void 0 ? void 0 : params.errorMap,
          },
          path:
            (params === null || params === void 0 ? void 0 : params.path) || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_1.getParsedType)(data),
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        var _a, _b;
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async,
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_1.getParsedType)(data),
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return (0, parseUtil_1.isValid)(result)
              ? {
                  value: result.value,
                }
              : {
                  issues: ctx.common.issues,
                };
          } catch (err) {
            if (
              (_b =
                (_a = err === null || err === void 0 ? void 0 : err.message) ===
                  null || _a === void 0
                  ? void 0
                  : _a.toLowerCase()) === null || _b === void 0
                ? void 0
                : _b.includes("encountered")
            ) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true,
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then(
          (result) =>
            (0, parseUtil_1.isValid)(result)
              ? {
                  value: result.value,
                }
              : {
                  issues: ctx.common.issues,
                },
        );
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success) return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap:
              params === null || params === void 0 ? void 0 : params.errorMap,
            async: true,
          },
          path:
            (params === null || params === void 0 ? void 0 : params.path) || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: (0, util_1.getParsedType)(data),
        };
        const maybeAsyncResult = this._parse({
          data,
          path: ctx.path,
          parent: ctx,
        });
        const result = await ((0, parseUtil_1.isAsync)(maybeAsyncResult)
          ? maybeAsyncResult
          : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () =>
            ctx.addIssue({
              code: ZodError_1.ZodIssueCode.custom,
              ...getIssueProperties(val),
            });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(
              typeof refinementData === "function"
                ? refinementData(val, ctx)
                : refinementData,
            );
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement },
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data),
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform },
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault,
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def),
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch,
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description,
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    exports2.ZodType = ZodType;
    exports2.Schema = ZodType;
    exports2.ZodSchema = ZodType;
    var cuidRegex = /^c[^\s-]{8,}$/i;
    var cuid2Regex = /^[0-9a-z]+$/;
    var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    var uuidRegex =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    var nanoidRegex = /^[a-z0-9_-]{21}$/i;
    var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    var durationRegex =
      /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    var emailRegex =
      /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    var emojiRegex;
    var ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    var ipv4CidrRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    var ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    var ipv6CidrRegex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    var base64Regex =
      /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    var base64urlRegex =
      /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    var dateRegex = new RegExp(`^${dateRegexSource}$`);
    function timeRegexSource(args) {
      let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;
      if (args.precision) {
        regex = `${regex}\\.\\d{${args.precision}}`;
      } else if (args.precision == null) {
        regex = `${regex}(\\.\\d+)?`;
      }
      return regex;
    }
    function timeRegex(args) {
      return new RegExp(`^${timeRegexSource(args)}$`);
    }
    function datetimeRegex(args) {
      let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
      const opts = [];
      opts.push(args.local ? `Z?` : `Z`);
      if (args.offset) opts.push(`([+-]\\d{2}:?\\d{2})`);
      regex = `${regex}(${opts.join("|")})`;
      return new RegExp(`^${regex}$`);
    }
    exports2.datetimeRegex = datetimeRegex;
    function isValidIP(ip, version) {
      if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
      }
      if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
      }
      return false;
    }
    function isValidJWT(jwt, alg) {
      if (!jwtRegex.test(jwt)) return false;
      try {
        const [header] = jwt.split(".");
        const base64 = header
          .replace(/-/g, "+")
          .replace(/_/g, "/")
          .padEnd(header.length + ((4 - (header.length % 4)) % 4), "=");
        const decoded = JSON.parse(atob(base64));
        if (typeof decoded !== "object" || decoded === null) return false;
        if (!decoded.typ || !decoded.alg) return false;
        if (alg && decoded.alg !== alg) return false;
        return true;
      } catch (_a) {
        return false;
      }
    }
    function isValidCidr(ip, version) {
      if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
        return true;
      }
      if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
        return true;
      }
      return false;
    }
    var ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx2, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.string,
            received: ctx2.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        const status = new parseUtil_1.ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                  code: ZodError_1.ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message,
                });
              } else if (tooSmall) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                  code: ZodError_1.ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message,
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "email",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "emoji",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "uuid",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "nanoid",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "cuid",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "cuid2",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "ulid",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch (_a) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "url",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "regex",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "duration",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "ip",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "jwt",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "cidr",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "base64",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                validation: "base64url",
                code: ZodError_1.ZodIssueCode.invalid_string,
                message: check.message,
              });
              status.dirty();
            }
          } else {
            util_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodError_1.ZodIssueCode.invalid_string,
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check],
        });
      }
      email(message) {
        return this._addCheck({
          kind: "email",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      url(message) {
        return this._addCheck({
          kind: "url",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      emoji(message) {
        return this._addCheck({
          kind: "emoji",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      uuid(message) {
        return this._addCheck({
          kind: "uuid",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      nanoid(message) {
        return this._addCheck({
          kind: "nanoid",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      cuid(message) {
        return this._addCheck({
          kind: "cuid",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      cuid2(message) {
        return this._addCheck({
          kind: "cuid2",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      ulid(message) {
        return this._addCheck({
          kind: "ulid",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      base64(message) {
        return this._addCheck({
          kind: "base64",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      jwt(options) {
        return this._addCheck({
          kind: "jwt",
          ...errorUtil_1.errorUtil.errToObj(options),
        });
      }
      ip(options) {
        return this._addCheck({
          kind: "ip",
          ...errorUtil_1.errorUtil.errToObj(options),
        });
      }
      cidr(options) {
        return this._addCheck({
          kind: "cidr",
          ...errorUtil_1.errorUtil.errToObj(options),
        });
      }
      datetime(options) {
        var _a, _b;
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options,
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision:
            typeof (options === null || options === void 0
              ? void 0
              : options.precision) === "undefined"
              ? null
              : options === null || options === void 0
                ? void 0
                : options.precision,
          offset:
            (_a =
              options === null || options === void 0
                ? void 0
                : options.offset) !== null && _a !== void 0
              ? _a
              : false,
          local:
            (_b =
              options === null || options === void 0
                ? void 0
                : options.local) !== null && _b !== void 0
              ? _b
              : false,
          ...errorUtil_1.errorUtil.errToObj(
            options === null || options === void 0 ? void 0 : options.message,
          ),
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options,
          });
        }
        return this._addCheck({
          kind: "time",
          precision:
            typeof (options === null || options === void 0
              ? void 0
              : options.precision) === "undefined"
              ? null
              : options === null || options === void 0
                ? void 0
                : options.precision,
          ...errorUtil_1.errorUtil.errToObj(
            options === null || options === void 0 ? void 0 : options.message,
          ),
        });
      }
      duration(message) {
        return this._addCheck({
          kind: "duration",
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position:
            options === null || options === void 0 ? void 0 : options.position,
          ...errorUtil_1.errorUtil.errToObj(
            options === null || options === void 0 ? void 0 : options.message,
          ),
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil_1.errorUtil.errToObj(message),
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil_1.errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }],
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }],
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }],
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min) min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max) max = ch.value;
          }
        }
        return max;
      }
    };
    exports2.ZodString = ZodString;
    ZodString.create = (params) => {
      var _a;
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce:
          (_a =
            params === null || params === void 0 ? void 0 : params.coerce) !==
            null && _a !== void 0
            ? _a
            : false,
        ...processCreateParams(params),
      });
    };
    function floatSafeRemainder(val, step) {
      const valDecCount = (val.toString().split(".")[1] || "").length;
      const stepDecCount = (step.toString().split(".")[1] || "").length;
      const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
      const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
      const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
      return (valInt % stepInt) / Math.pow(10, decCount);
    }
    var ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx2, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.number,
            received: ctx2.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        let ctx = void 0;
        const status = new parseUtil_1.ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util_1.util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive
              ? input.data < check.value
              : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive
              ? input.data > check.value
              : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.not_finite,
                message: check.message,
              });
              status.dirty();
            }
          } else {
            util_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit(
          "min",
          value,
          true,
          errorUtil_1.errorUtil.toString(message),
        );
      }
      gt(value, message) {
        return this.setLimit(
          "min",
          value,
          false,
          errorUtil_1.errorUtil.toString(message),
        );
      }
      lte(value, message) {
        return this.setLimit(
          "max",
          value,
          true,
          errorUtil_1.errorUtil.toString(message),
        );
      }
      lt(value, message) {
        return this.setLimit(
          "max",
          value,
          false,
          errorUtil_1.errorUtil.toString(message),
        );
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil_1.errorUtil.toString(message),
            },
          ],
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check],
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil_1.errorUtil.toString(message),
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min) min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max) max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find(
          (ch) =>
            ch.kind === "int" ||
            (ch.kind === "multipleOf" && util_1.util.isInteger(ch.value)),
        );
      }
      get isFinite() {
        let max = null,
          min = null;
        for (const ch of this._def.checks) {
          if (
            ch.kind === "finite" ||
            ch.kind === "int" ||
            ch.kind === "multipleOf"
          ) {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min) min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max) max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    exports2.ZodNumber = ZodNumber;
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce:
          (params === null || params === void 0 ? void 0 : params.coerce) ||
          false,
        ...processCreateParams(params),
      });
    };
    var ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch (_a) {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new parseUtil_1.ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive
              ? input.data < check.value
              : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive
              ? input.data > check.value
              : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message,
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message,
              });
              status.dirty();
            }
          } else {
            util_1.util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_1.addIssueToContext)(ctx, {
          code: ZodError_1.ZodIssueCode.invalid_type,
          expected: util_1.ZodParsedType.bigint,
          received: ctx.parsedType,
        });
        return parseUtil_1.INVALID;
      }
      gte(value, message) {
        return this.setLimit(
          "min",
          value,
          true,
          errorUtil_1.errorUtil.toString(message),
        );
      }
      gt(value, message) {
        return this.setLimit(
          "min",
          value,
          false,
          errorUtil_1.errorUtil.toString(message),
        );
      }
      lte(value, message) {
        return this.setLimit(
          "max",
          value,
          true,
          errorUtil_1.errorUtil.toString(message),
        );
      }
      lt(value, message) {
        return this.setLimit(
          "max",
          value,
          false,
          errorUtil_1.errorUtil.toString(message),
        );
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil_1.errorUtil.toString(message),
            },
          ],
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check],
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min) min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max) max = ch.value;
          }
        }
        return max;
      }
    };
    exports2.ZodBigInt = ZodBigInt;
    ZodBigInt.create = (params) => {
      var _a;
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce:
          (_a =
            params === null || params === void 0 ? void 0 : params.coerce) !==
            null && _a !== void 0
            ? _a
            : false,
        ...processCreateParams(params),
      });
    };
    var ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.boolean,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
      }
    };
    exports2.ZodBoolean = ZodBoolean;
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce:
          (params === null || params === void 0 ? void 0 : params.coerce) ||
          false,
        ...processCreateParams(params),
      });
    };
    var ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx2, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.date,
            received: ctx2.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        if (isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx2, {
            code: ZodError_1.ZodIssueCode.invalid_date,
          });
          return parseUtil_1.INVALID;
        }
        const status = new parseUtil_1.ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date",
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date",
              });
              status.dirty();
            }
          } else {
            util_1.util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime()),
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check],
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil_1.errorUtil.toString(message),
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min) min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max) max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    exports2.ZodDate = ZodDate;
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce:
          (params === null || params === void 0 ? void 0 : params.coerce) ||
          false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params),
      });
    };
    var ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.symbol,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
      }
    };
    exports2.ZodSymbol = ZodSymbol;
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params),
      });
    };
    var ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.undefined,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
      }
    };
    exports2.ZodUndefined = ZodUndefined;
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params),
      });
    };
    var ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.null,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
      }
    };
    exports2.ZodNull = ZodNull;
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params),
      });
    };
    var ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return (0, parseUtil_1.OK)(input.data);
      }
    };
    exports2.ZodAny = ZodAny;
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params),
      });
    };
    var ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return (0, parseUtil_1.OK)(input.data);
      }
    };
    exports2.ZodUnknown = ZodUnknown;
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params),
      });
    };
    var ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_1.addIssueToContext)(ctx, {
          code: ZodError_1.ZodIssueCode.invalid_type,
          expected: util_1.ZodParsedType.never,
          received: ctx.parsedType,
        });
        return parseUtil_1.INVALID;
      }
    };
    exports2.ZodNever = ZodNever;
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params),
      });
    };
    var ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.void,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
      }
    };
    exports2.ZodVoid = ZodVoid;
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params),
      });
    };
    var ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== util_1.ZodParsedType.array) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.array,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
              code: tooBig
                ? ZodError_1.ZodIssueCode.too_big
                : ZodError_1.ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message,
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
              code: ZodError_1.ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message,
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
              code: ZodError_1.ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message,
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all(
            [...ctx.data].map((item, i) => {
              return def.type._parseAsync(
                new ParseInputLazyPath(ctx, item, ctx.path, i),
              );
            }),
          ).then((result2) => {
            return parseUtil_1.ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(
            new ParseInputLazyPath(ctx, item, ctx.path, i),
          );
        });
        return parseUtil_1.ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: {
            value: minLength,
            message: errorUtil_1.errorUtil.toString(message),
          },
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: {
            value: maxLength,
            message: errorUtil_1.errorUtil.toString(message),
          },
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: {
            value: len,
            message: errorUtil_1.errorUtil.toString(message),
          },
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    exports2.ZodArray = ZodArray;
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params),
      });
    };
    function deepPartialify(schema) {
      if (schema instanceof ZodObject) {
        const newShape = {};
        for (const key in schema.shape) {
          const fieldSchema = schema.shape[key];
          newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
          ...schema._def,
          shape: () => newShape,
        });
      } else if (schema instanceof ZodArray) {
        return new ZodArray({
          ...schema._def,
          type: deepPartialify(schema.element),
        });
      } else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
      } else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
      } else if (schema instanceof ZodTuple) {
        return ZodTuple.create(
          schema.items.map((item) => deepPartialify(item)),
        );
      } else {
        return schema;
      }
    }
    var ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null) return this._cached;
        const shape = this._def.shape();
        const keys = util_1.util.objectKeys(shape);
        return (this._cached = { shape, keys });
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx2, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.object,
            received: ctx2.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (
          !(
            this._def.catchall instanceof ZodNever &&
            this._def.unknownKeys === "strip"
          )
        ) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(
              new ParseInputLazyPath(ctx, value, ctx.path, key),
            ),
            alwaysSet: key in ctx.data,
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] },
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.unrecognized_keys,
                keys: extraKeys,
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(
              `Internal ZodObject error: invalid unknownKeys value.`,
            );
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key),
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data,
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve()
            .then(async () => {
              const syncPairs = [];
              for (const pair of pairs) {
                const key = await pair.key;
                const value = await pair.value;
                syncPairs.push({
                  key,
                  value,
                  alwaysSet: pair.alwaysSet,
                });
              }
              return syncPairs;
            })
            .then((syncPairs) => {
              return parseUtil_1.ParseStatus.mergeObjectSync(status, syncPairs);
            });
        } else {
          return parseUtil_1.ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil_1.errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...(message !== void 0
            ? {
                errorMap: (issue, ctx) => {
                  var _a, _b, _c, _d;
                  const defaultError =
                    (_c =
                      (_b = (_a = this._def).errorMap) === null || _b === void 0
                        ? void 0
                        : _b.call(_a, issue, ctx).message) !== null &&
                    _c !== void 0
                      ? _c
                      : ctx.defaultError;
                  if (issue.code === "unrecognized_keys")
                    return {
                      message:
                        (_d =
                          errorUtil_1.errorUtil.errToObj(message).message) !==
                          null && _d !== void 0
                          ? _d
                          : defaultError,
                    };
                  return {
                    message: defaultError,
                  };
                },
              }
            : {}),
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip",
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough",
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation,
          }),
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape(),
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject,
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index,
        });
      }
      pick(mask) {
        const shape = {};
        util_1.util.objectKeys(mask).forEach((key) => {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        });
        return new _ZodObject({
          ...this._def,
          shape: () => shape,
        });
      }
      omit(mask) {
        const shape = {};
        util_1.util.objectKeys(this.shape).forEach((key) => {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        });
        return new _ZodObject({
          ...this._def,
          shape: () => shape,
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        util_1.util.objectKeys(this.shape).forEach((key) => {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        });
        return new _ZodObject({
          ...this._def,
          shape: () => newShape,
        });
      }
      required(mask) {
        const newShape = {};
        util_1.util.objectKeys(this.shape).forEach((key) => {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        });
        return new _ZodObject({
          ...this._def,
          shape: () => newShape,
        });
      }
      keyof() {
        return createZodEnum(util_1.util.objectKeys(this.shape));
      }
    };
    exports2.ZodObject = ZodObject;
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
      });
    };
    var ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map(
            (result) => new ZodError_1.ZodError(result.ctx.common.issues),
          );
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_union,
            unionErrors,
          });
          return parseUtil_1.INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(
            options.map(async (option) => {
              const childCtx = {
                ...ctx,
                common: {
                  ...ctx.common,
                  issues: [],
                },
                parent: null,
              };
              return {
                result: await option._parseAsync({
                  data: ctx.data,
                  path: ctx.path,
                  parent: childCtx,
                }),
                ctx: childCtx,
              };
            }),
          ).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: [],
              },
              parent: null,
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx,
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map(
            (issues2) => new ZodError_1.ZodError(issues2),
          );
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_union,
            unionErrors,
          });
          return parseUtil_1.INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    exports2.ZodUnion = ZodUnion;
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params),
      });
    };
    var getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util_1.util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.object) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.object,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator],
          });
          return parseUtil_1.INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx,
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx,
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(
            type.shape[discriminator],
          );
          if (!discriminatorValues.length) {
            throw new Error(
              `A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`,
            );
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(
                `Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`,
              );
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params),
        });
      }
    };
    exports2.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
    function mergeValues(a, b) {
      const aType = (0, util_1.getParsedType)(a);
      const bType = (0, util_1.getParsedType)(b);
      if (a === b) {
        return { valid: true, data: a };
      } else if (
        aType === util_1.ZodParsedType.object &&
        bType === util_1.ZodParsedType.object
      ) {
        const bKeys = util_1.util.objectKeys(b);
        const sharedKeys = util_1.util
          .objectKeys(a)
          .filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
          const sharedValue = mergeValues(a[key], b[key]);
          if (!sharedValue.valid) {
            return { valid: false };
          }
          newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
      } else if (
        aType === util_1.ZodParsedType.array &&
        bType === util_1.ZodParsedType.array
      ) {
        if (a.length !== b.length) {
          return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
          const itemA = a[index];
          const itemB = b[index];
          const sharedValue = mergeValues(itemA, itemB);
          if (!sharedValue.valid) {
            return { valid: false };
          }
          newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
      } else if (
        aType === util_1.ZodParsedType.date &&
        bType === util_1.ZodParsedType.date &&
        +a === +b
      ) {
        return { valid: true, data: a };
      } else {
        return { valid: false };
      }
    }
    var ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if (
            (0, parseUtil_1.isAborted)(parsedLeft) ||
            (0, parseUtil_1.isAborted)(parsedRight)
          ) {
            return parseUtil_1.INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
              code: ZodError_1.ZodIssueCode.invalid_intersection_types,
            });
            return parseUtil_1.INVALID;
          }
          if (
            (0, parseUtil_1.isDirty)(parsedLeft) ||
            (0, parseUtil_1.isDirty)(parsedRight)
          ) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx,
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx,
            }),
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(
            this._def.left._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx,
            }),
            this._def.right._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx,
            }),
          );
        }
      }
    };
    exports2.ZodIntersection = ZodIntersection;
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params),
      });
    };
    var ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.array) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.array,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array",
          });
          return parseUtil_1.INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array",
          });
          status.dirty();
        }
        const items = [...ctx.data]
          .map((item, itemIndex) => {
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema) return null;
            return schema._parse(
              new ParseInputLazyPath(ctx, item, ctx.path, itemIndex),
            );
          })
          .filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return parseUtil_1.ParseStatus.mergeArray(status, results);
          });
        } else {
          return parseUtil_1.ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest,
        });
      }
    };
    exports2.ZodTuple = ZodTuple;
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error(
          "You must pass an array of schemas to z.tuple([ ... ])",
        );
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params),
      });
    };
    var ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.object) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.object,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(
              new ParseInputLazyPath(ctx, key, ctx.path, key),
            ),
            value: valueType._parse(
              new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key),
            ),
            alwaysSet: key in ctx.data,
          });
        }
        if (ctx.common.async) {
          return parseUtil_1.ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return parseUtil_1.ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third),
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second),
        });
      }
    };
    exports2.ZodRecord = ZodRecord;
    var ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.map) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.map,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(
              new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"]),
            ),
            value: valueType._parse(
              new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]),
            ),
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return parseUtil_1.INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return parseUtil_1.INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    exports2.ZodMap = ZodMap;
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params),
      });
    };
    var ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.set) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.set,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
              code: ZodError_1.ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message,
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
              code: ZodError_1.ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message,
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted") return parseUtil_1.INVALID;
            if (element.status === "dirty") status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) =>
          valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)),
        );
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) =>
            finalizeSet(elements2),
          );
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: {
            value: minSize,
            message: errorUtil_1.errorUtil.toString(message),
          },
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: {
            value: maxSize,
            message: errorUtil_1.errorUtil.toString(message),
          },
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    exports2.ZodSet = ZodSet;
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params),
      });
    };
    var ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.function) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.function,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        function makeArgsIssue(args, error) {
          return (0, parseUtil_1.makeIssue)({
            data: args,
            path: ctx.path,
            errorMaps: [
              ctx.common.contextualErrorMap,
              ctx.schemaErrorMap,
              (0, errors_1.getErrorMap)(),
              errors_1.defaultErrorMap,
            ].filter((x) => !!x),
            issueData: {
              code: ZodError_1.ZodIssueCode.invalid_arguments,
              argumentsError: error,
            },
          });
        }
        function makeReturnsIssue(returns, error) {
          return (0, parseUtil_1.makeIssue)({
            data: returns,
            path: ctx.path,
            errorMaps: [
              ctx.common.contextualErrorMap,
              ctx.schemaErrorMap,
              (0, errors_1.getErrorMap)(),
              errors_1.defaultErrorMap,
            ].filter((x) => !!x),
            issueData: {
              code: ZodError_1.ZodIssueCode.invalid_return_type,
              returnTypeError: error,
            },
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return (0, parseUtil_1.OK)(async function (...args) {
            const error = new ZodError_1.ZodError([]);
            const parsedArgs = await me._def.args
              .parseAsync(args, params)
              .catch((e) => {
                error.addIssue(makeArgsIssue(args, e));
                throw error;
              });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type
              .parseAsync(result, params)
              .catch((e) => {
                error.addIssue(makeReturnsIssue(result, e));
                throw error;
              });
            return parsedReturns;
          });
        } else {
          const me = this;
          return (0, parseUtil_1.OK)(function (...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError_1.ZodError([
                makeArgsIssue(args, parsedArgs.error),
              ]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError_1.ZodError([
                makeReturnsIssue(result, parsedReturns.error),
              ]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create()),
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType,
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params),
        });
      }
    };
    exports2.ZodFunction = ZodFunction;
    var ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({
          data: ctx.data,
          path: ctx.path,
          parent: ctx,
        });
      }
    };
    exports2.ZodLazy = ZodLazy;
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params),
      });
    };
    var ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_1.ZodIssueCode.invalid_literal,
            expected: this._def.value,
          });
          return parseUtil_1.INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    exports2.ZodLiteral = ZodLiteral;
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params),
      });
    };
    function createZodEnum(values, params) {
      return new ZodEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params),
      });
    }
    var ZodEnum = class _ZodEnum extends ZodType {
      constructor() {
        super(...arguments);
        _ZodEnum_cache.set(this, void 0);
      }
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          (0, parseUtil_1.addIssueToContext)(ctx, {
            expected: util_1.util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodError_1.ZodIssueCode.invalid_type,
          });
          return parseUtil_1.INVALID;
        }
        if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f")) {
          __classPrivateFieldSet(
            this,
            _ZodEnum_cache,
            new Set(this._def.values),
            "f",
          );
        }
        if (
          !__classPrivateFieldGet(this, _ZodEnum_cache, "f").has(input.data)
        ) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          (0, parseUtil_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_1.ZodIssueCode.invalid_enum_value,
            options: expectedValues,
          });
          return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef,
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(
          this.options.filter((opt) => !values.includes(opt)),
          {
            ...this._def,
            ...newDef,
          },
        );
      }
    };
    exports2.ZodEnum = ZodEnum;
    _ZodEnum_cache = /* @__PURE__ */ new WeakMap();
    ZodEnum.create = createZodEnum;
    var ZodNativeEnum = class extends ZodType {
      constructor() {
        super(...arguments);
        _ZodNativeEnum_cache.set(this, void 0);
      }
      _parse(input) {
        const nativeEnumValues = util_1.util.getValidEnumValues(
          this._def.values,
        );
        const ctx = this._getOrReturnCtx(input);
        if (
          ctx.parsedType !== util_1.ZodParsedType.string &&
          ctx.parsedType !== util_1.ZodParsedType.number
        ) {
          const expectedValues = util_1.util.objectValues(nativeEnumValues);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            expected: util_1.util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodError_1.ZodIssueCode.invalid_type,
          });
          return parseUtil_1.INVALID;
        }
        if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f")) {
          __classPrivateFieldSet(
            this,
            _ZodNativeEnum_cache,
            new Set(util_1.util.getValidEnumValues(this._def.values)),
            "f",
          );
        }
        if (
          !__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f").has(
            input.data,
          )
        ) {
          const expectedValues = util_1.util.objectValues(nativeEnumValues);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            received: ctx.data,
            code: ZodError_1.ZodIssueCode.invalid_enum_value,
            options: expectedValues,
          });
          return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    exports2.ZodNativeEnum = ZodNativeEnum;
    _ZodNativeEnum_cache = /* @__PURE__ */ new WeakMap();
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params),
      });
    };
    var ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (
          ctx.parsedType !== util_1.ZodParsedType.promise &&
          ctx.common.async === false
        ) {
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.promise,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        const promisified =
          ctx.parsedType === util_1.ZodParsedType.promise
            ? ctx.data
            : Promise.resolve(ctx.data);
        return (0, parseUtil_1.OK)(
          promisified.then((data) => {
            return this._def.type.parseAsync(data, {
              path: ctx.path,
              errorMap: ctx.common.contextualErrorMap,
            });
          }),
        );
      }
    };
    exports2.ZodPromise = ZodPromise;
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params),
      });
    };
    var ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName ===
          ZodFirstPartyTypeKind.ZodEffects
          ? this._def.schema.sourceType()
          : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            (0, parseUtil_1.addIssueToContext)(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          },
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted") return parseUtil_1.INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx,
              });
              if (result.status === "aborted") return parseUtil_1.INVALID;
              if (result.status === "dirty")
                return (0, parseUtil_1.DIRTY)(result.value);
              if (status.value === "dirty")
                return (0, parseUtil_1.DIRTY)(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted") return parseUtil_1.INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx,
            });
            if (result.status === "aborted") return parseUtil_1.INVALID;
            if (result.status === "dirty")
              return (0, parseUtil_1.DIRTY)(result.value);
            if (status.value === "dirty")
              return (0, parseUtil_1.DIRTY)(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error(
                "Async refinement encountered during synchronous parse operation. Use .parseAsync instead.",
              );
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx,
            });
            if (inner.status === "aborted") return parseUtil_1.INVALID;
            if (inner.status === "dirty") status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema
              ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
              .then((inner) => {
                if (inner.status === "aborted") return parseUtil_1.INVALID;
                if (inner.status === "dirty") status.dirty();
                return executeRefinement(inner.value).then(() => {
                  return { status: status.value, value: inner.value };
                });
              });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx,
            });
            if (!(0, parseUtil_1.isValid)(base)) return base;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(
                `Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`,
              );
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema
              ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
              .then((base) => {
                if (!(0, parseUtil_1.isValid)(base)) return base;
                return Promise.resolve(
                  effect.transform(base.value, checkCtx),
                ).then((result) => ({ status: status.value, value: result }));
              });
          }
        }
        util_1.util.assertNever(effect);
      }
    };
    exports2.ZodEffects = ZodEffects;
    exports2.ZodTransformer = ZodEffects;
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params),
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params),
      });
    };
    var ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_1.ZodParsedType.undefined) {
          return (0, parseUtil_1.OK)(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports2.ZodOptional = ZodOptional;
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params),
      });
    };
    var ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_1.ZodParsedType.null) {
          return (0, parseUtil_1.OK)(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports2.ZodNullable = ZodNullable;
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params),
      });
    };
    var ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === util_1.ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx,
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    exports2.ZodDefault = ZodDefault;
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue:
          typeof params.default === "function"
            ? params.default
            : () => params.default,
        ...processCreateParams(params),
      });
    };
    var ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: [],
          },
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx,
          },
        });
        if ((0, parseUtil_1.isAsync)(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value:
                result2.status === "valid"
                  ? result2.value
                  : this._def.catchValue({
                      get error() {
                        return new ZodError_1.ZodError(newCtx.common.issues);
                      },
                      input: newCtx.data,
                    }),
            };
          });
        } else {
          return {
            status: "valid",
            value:
              result.status === "valid"
                ? result.value
                : this._def.catchValue({
                    get error() {
                      return new ZodError_1.ZodError(newCtx.common.issues);
                    },
                    input: newCtx.data,
                  }),
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    exports2.ZodCatch = ZodCatch;
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue:
          typeof params.catch === "function"
            ? params.catch
            : () => params.catch,
        ...processCreateParams(params),
      });
    };
    var ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.nan,
            received: ctx.parsedType,
          });
          return parseUtil_1.INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    exports2.ZodNaN = ZodNaN;
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params),
      });
    };
    exports2.BRAND = Symbol("zod_brand");
    var ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx,
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    exports2.ZodBranded = ZodBranded;
    var ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx,
            });
            if (inResult.status === "aborted") return parseUtil_1.INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return (0, parseUtil_1.DIRTY)(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx,
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx,
          });
          if (inResult.status === "aborted") return parseUtil_1.INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value,
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx,
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline,
        });
      }
    };
    exports2.ZodPipeline = ZodPipeline;
    var ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
          if ((0, parseUtil_1.isValid)(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return (0, parseUtil_1.isAsync)(result)
          ? result.then((data) => freeze(data))
          : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    exports2.ZodReadonly = ZodReadonly;
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params),
      });
    };
    function cleanParams(params, data) {
      const p =
        typeof params === "function"
          ? params(data)
          : typeof params === "string"
            ? { message: params }
            : params;
      const p2 = typeof p === "string" ? { message: p } : p;
      return p2;
    }
    function custom(check, _params = {}, fatal) {
      if (check)
        return ZodAny.create().superRefine((data, ctx) => {
          var _a, _b;
          const r = check(data);
          if (r instanceof Promise) {
            return r.then((r2) => {
              var _a2, _b2;
              if (!r2) {
                const params = cleanParams(_params, data);
                const _fatal =
                  (_b2 =
                    (_a2 = params.fatal) !== null && _a2 !== void 0
                      ? _a2
                      : fatal) !== null && _b2 !== void 0
                    ? _b2
                    : true;
                ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
              }
            });
          }
          if (!r) {
            const params = cleanParams(_params, data);
            const _fatal =
              (_b =
                (_a = params.fatal) !== null && _a !== void 0 ? _a : fatal) !==
                null && _b !== void 0
                ? _b
                : true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
          return;
        });
      return ZodAny.create();
    }
    exports2.custom = custom;
    exports2.late = {
      object: ZodObject.lazycreate,
    };
    var ZodFirstPartyTypeKind;
    (function (ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(
      ZodFirstPartyTypeKind ||
        (exports2.ZodFirstPartyTypeKind = ZodFirstPartyTypeKind = {}),
    );
    var instanceOfType = (
      cls,
      params = {
        message: `Input not instance of ${cls.name}`,
      },
    ) => custom((data) => data instanceof cls, params);
    exports2.instanceof = instanceOfType;
    var stringType = ZodString.create;
    exports2.string = stringType;
    var numberType = ZodNumber.create;
    exports2.number = numberType;
    var nanType = ZodNaN.create;
    exports2.nan = nanType;
    var bigIntType = ZodBigInt.create;
    exports2.bigint = bigIntType;
    var booleanType = ZodBoolean.create;
    exports2.boolean = booleanType;
    var dateType = ZodDate.create;
    exports2.date = dateType;
    var symbolType = ZodSymbol.create;
    exports2.symbol = symbolType;
    var undefinedType = ZodUndefined.create;
    exports2.undefined = undefinedType;
    var nullType = ZodNull.create;
    exports2.null = nullType;
    var anyType = ZodAny.create;
    exports2.any = anyType;
    var unknownType = ZodUnknown.create;
    exports2.unknown = unknownType;
    var neverType = ZodNever.create;
    exports2.never = neverType;
    var voidType = ZodVoid.create;
    exports2.void = voidType;
    var arrayType = ZodArray.create;
    exports2.array = arrayType;
    var objectType = ZodObject.create;
    exports2.object = objectType;
    var strictObjectType = ZodObject.strictCreate;
    exports2.strictObject = strictObjectType;
    var unionType = ZodUnion.create;
    exports2.union = unionType;
    var discriminatedUnionType = ZodDiscriminatedUnion.create;
    exports2.discriminatedUnion = discriminatedUnionType;
    var intersectionType = ZodIntersection.create;
    exports2.intersection = intersectionType;
    var tupleType = ZodTuple.create;
    exports2.tuple = tupleType;
    var recordType = ZodRecord.create;
    exports2.record = recordType;
    var mapType = ZodMap.create;
    exports2.map = mapType;
    var setType = ZodSet.create;
    exports2.set = setType;
    var functionType = ZodFunction.create;
    exports2.function = functionType;
    var lazyType = ZodLazy.create;
    exports2.lazy = lazyType;
    var literalType = ZodLiteral.create;
    exports2.literal = literalType;
    var enumType = ZodEnum.create;
    exports2.enum = enumType;
    var nativeEnumType = ZodNativeEnum.create;
    exports2.nativeEnum = nativeEnumType;
    var promiseType = ZodPromise.create;
    exports2.promise = promiseType;
    var effectsType = ZodEffects.create;
    exports2.effect = effectsType;
    exports2.transformer = effectsType;
    var optionalType = ZodOptional.create;
    exports2.optional = optionalType;
    var nullableType = ZodNullable.create;
    exports2.nullable = nullableType;
    var preprocessType = ZodEffects.createWithPreprocess;
    exports2.preprocess = preprocessType;
    var pipelineType = ZodPipeline.create;
    exports2.pipeline = pipelineType;
    var ostring = () => stringType().optional();
    exports2.ostring = ostring;
    var onumber = () => numberType().optional();
    exports2.onumber = onumber;
    var oboolean = () => booleanType().optional();
    exports2.oboolean = oboolean;
    exports2.coerce = {
      string: (arg) => ZodString.create({ ...arg, coerce: true }),
      number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
      boolean: (arg) =>
        ZodBoolean.create({
          ...arg,
          coerce: true,
        }),
      bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
      date: (arg) => ZodDate.create({ ...arg, coerce: true }),
    };
    exports2.NEVER = parseUtil_1.INVALID;
  },
});

// node_modules/zod/lib/external.js
var require_external = __commonJS({
  "node_modules/zod/lib/external.js"(exports2) {
    "use strict";
    var __createBinding =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __exportStar =
      (exports2 && exports2.__exportStar) ||
      function (m, exports3) {
        for (var p in m)
          if (
            p !== "default" &&
            !Object.prototype.hasOwnProperty.call(exports3, p)
          )
            __createBinding(exports3, m, p);
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_errors2(), exports2);
    __exportStar(require_parseUtil(), exports2);
    __exportStar(require_typeAliases(), exports2);
    __exportStar(require_util(), exports2);
    __exportStar(require_types(), exports2);
    __exportStar(require_ZodError(), exports2);
  },
});

// node_modules/zod/lib/index.js
var require_lib = __commonJS({
  "node_modules/zod/lib/index.js"(exports2) {
    "use strict";
    var __createBinding =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (exports2 && exports2.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
            o["default"] = v;
          });
    var __importStar =
      (exports2 && exports2.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
              __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    var __exportStar =
      (exports2 && exports2.__exportStar) ||
      function (m, exports3) {
        for (var p in m)
          if (
            p !== "default" &&
            !Object.prototype.hasOwnProperty.call(exports3, p)
          )
            __createBinding(exports3, m, p);
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.z = void 0;
    var z = __importStar(require_external());
    exports2.z = z;
    __exportStar(require_external(), exports2);
    exports2.default = z;
  },
});

// node_modules/@aws-amplify/platform-core/lib/package_json_reader.js
var require_package_json_reader = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/package_json_reader.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.packageJsonSchema = exports2.PackageJsonReader = void 0;
    var fs_1 = __importDefault(require("fs"));
    var path_1 = __importDefault(require("path"));
    var zod_1 = __importDefault(require_lib());
    var errors_1 = require_errors();
    var PackageJsonReader = class {
      read = (absolutePackageJsonPath) => {
        if (!fs_1.default.existsSync(absolutePackageJsonPath)) {
          throw new errors_1.AmplifyUserError("InvalidPackageJsonError", {
            message: `Could not find a package.json file at ${absolutePackageJsonPath}`,
            resolution: `Ensure that ${absolutePackageJsonPath} exists and is a valid JSON file`,
          });
        }
        let jsonParsedValue;
        try {
          jsonParsedValue = JSON.parse(
            // we have to use sync fs methods here because this is also used during cdk synth
            fs_1.default.readFileSync(absolutePackageJsonPath, "utf-8"),
          );
        } catch (err) {
          throw new errors_1.AmplifyUserError(
            "InvalidPackageJsonError",
            {
              message: `Could not parse the contents of ${absolutePackageJsonPath}`,
              resolution: `Ensure that ${absolutePackageJsonPath} exists and is a valid JSON file`,
            },
            err,
          );
        }
        return exports2.packageJsonSchema.parse(jsonParsedValue);
      };
      /**
       * Returns the contents of the package.json file in process.cwd()
       *
       * If no package.json file exists, or the content does not pass validation, an error is thrown
       */
      readFromCwd = () => {
        return this.read(path_1.default.resolve(process.cwd(), "package.json"));
      };
    };
    exports2.PackageJsonReader = PackageJsonReader;
    exports2.packageJsonSchema = zod_1.default.object({
      name: zod_1.default.string().optional(),
      version: zod_1.default.string().optional(),
      type: zod_1.default
        .union([
          zod_1.default.literal("module"),
          zod_1.default.literal("commonjs"),
        ])
        .optional(),
    });
  },
});

// node_modules/@aws-amplify/platform-core/lib/config/get_config_dir_path.js
var require_get_config_dir_path = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/config/get_config_dir_path.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getConfigDirPath = void 0;
    var os_1 = __importDefault(require("os"));
    var path_1 = __importDefault(require("path"));
    var getConfigDirPath = () => {
      const amplifyConfigDirName = "amplify";
      const homedir = os_1.default.homedir();
      const macos = () =>
        path_1.default.join(
          homedir,
          "Library",
          "Preferences",
          amplifyConfigDirName,
        );
      const windows = () => {
        return path_1.default.join(
          process.env.APPDATA ||
            path_1.default.join(homedir, "AppData", "Roaming"),
          amplifyConfigDirName,
          "Config",
        );
      };
      const linux = () => {
        return path_1.default.join(
          process.env.XDG_STATE_HOME ||
            path_1.default.join(homedir, ".local", "state"),
          amplifyConfigDirName,
        );
      };
      switch (process.platform) {
        case "darwin":
          return macos();
        case "win32":
          return windows();
        default:
          return linux();
      }
    };
    exports2.getConfigDirPath = getConfigDirPath;
  },
});

// node_modules/@aws-amplify/platform-core/lib/config/local_configuration_controller.js
var require_local_configuration_controller = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/config/local_configuration_controller.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LocalConfigurationController = void 0;
    var path_1 = __importDefault(require("path"));
    var promises_1 = __importDefault(require("fs/promises"));
    var get_config_dir_path_1 = require_get_config_dir_path();
    var LocalConfigurationController = class {
      configFileName;
      dirPath;
      configFilePath;
      _store;
      /**
       * Initializes paths to project config dir & config file.
       */
      constructor(configFileName = "config.json") {
        this.configFileName = configFileName;
        this.dirPath = (0, get_config_dir_path_1.getConfigDirPath)();
        this.configFilePath = path_1.default.join(
          this.dirPath,
          this.configFileName,
        );
      }
      /**
       * Gets values from cached config by path.
       */
      async get(path) {
        return path.split(".").reduce(
          (acc, current) => {
            return acc?.[current];
          },
          await this.store(),
        );
      }
      /**
       * Set value by path & update config file to disk.
       */
      async set(path, value) {
        let current = await this.store();
        path.split(".").forEach((key, index, keys) => {
          if (index === keys.length - 1) {
            current[key] = value;
          } else {
            if (current[key] == null) {
              current[key] = {};
            }
            current = current[key];
          }
        });
        await this.write();
      }
      /**
       * Writes config file to disk if found.
       */
      async write() {
        await this.mkConfigDir();
        const output = JSON.stringify(this._store ? this._store : {});
        await promises_1.default.writeFile(this.configFilePath, output, "utf8");
      }
      /**
       * Reset cached config and delete the config file.
       */
      async clear() {
        this._store = {};
        await promises_1.default.rm(this.configFilePath);
      }
      /**
       * Getter for cached config, retrieves config from disk if not cached already.
       * If the store is not cached & config file does not exist, it will create a blank one.
       */
      async store() {
        if (this._store) {
          return this._store;
        }
        let fd;
        try {
          fd = await promises_1.default.open(
            this.configFilePath,
            promises_1.default.constants.F_OK,
            promises_1.default.constants.O_RDWR,
          );
          const fileContent = await promises_1.default.readFile(fd, "utf-8");
          this._store = JSON.parse(fileContent);
        } catch {
          this._store = {};
          await this.write();
        } finally {
          await fd?.close();
        }
        return this._store;
      }
      /**
       * Creates project directory to store config if it doesn't exist yet.
       */
      mkConfigDir() {
        return promises_1.default.mkdir(this.dirPath, { recursive: true });
      }
    };
    exports2.LocalConfigurationController = LocalConfigurationController;
  },
});

// node_modules/@aws-amplify/platform-core/lib/config/local_configuration_controller_factory.js
var require_local_configuration_controller_factory = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/config/local_configuration_controller_factory.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.configControllerFactory = exports2.ConfigurationControllerFactory =
      void 0;
    var local_configuration_controller_js_1 =
      require_local_configuration_controller();
    var ConfigurationControllerFactory = class {
      controllers;
      /**
       * initialized empty map of ConfigurationController;
       */
      constructor() {
        this.controllers = {};
      }
      /**
       * Returns a LocalConfigurationController
       */
      getInstance = (configFileName) => {
        if (this.controllers[configFileName]) {
          return this.controllers[configFileName];
        }
        this.controllers[configFileName] =
          new local_configuration_controller_js_1.LocalConfigurationController(
            configFileName,
          );
        return this.controllers[configFileName];
      };
    };
    exports2.ConfigurationControllerFactory = ConfigurationControllerFactory;
    exports2.configControllerFactory = new ConfigurationControllerFactory();
  },
});

// node_modules/@aws-amplify/platform-core/lib/usage-data/noop_usage_data_emitter.js
var require_noop_usage_data_emitter = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/usage-data/noop_usage_data_emitter.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NoOpUsageDataEmitter = void 0;
    var NoOpUsageDataEmitter = class {
      /**
       * no-op emitSuccess
       */
      emitSuccess() {
        return Promise.resolve();
      }
      /**
       * no-op emitFailure
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emitFailure() {
        return Promise.resolve();
      }
    };
    exports2.NoOpUsageDataEmitter = NoOpUsageDataEmitter;
  },
});

// node_modules/uuid/dist/cjs/max.js
var require_max = __commonJS({
  "node_modules/uuid/dist/cjs/max.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  },
});

// node_modules/uuid/dist/cjs/nil.js
var require_nil = __commonJS({
  "node_modules/uuid/dist/cjs/nil.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "00000000-0000-0000-0000-000000000000";
  },
});

// node_modules/uuid/dist/cjs/regex.js
var require_regex = __commonJS({
  "node_modules/uuid/dist/cjs/regex.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default =
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
  },
});

// node_modules/uuid/dist/cjs/validate.js
var require_validate = __commonJS({
  "node_modules/uuid/dist/cjs/validate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var regex_js_1 = require_regex();
    function validate(uuid) {
      return typeof uuid === "string" && regex_js_1.default.test(uuid);
    }
    exports2.default = validate;
  },
});

// node_modules/uuid/dist/cjs/parse.js
var require_parse = __commonJS({
  "node_modules/uuid/dist/cjs/parse.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var validate_js_1 = require_validate();
    function parse(uuid) {
      if (!(0, validate_js_1.default)(uuid)) {
        throw TypeError("Invalid UUID");
      }
      let v;
      return Uint8Array.of(
        (v = parseInt(uuid.slice(0, 8), 16)) >>> 24,
        (v >>> 16) & 255,
        (v >>> 8) & 255,
        v & 255,
        (v = parseInt(uuid.slice(9, 13), 16)) >>> 8,
        v & 255,
        (v = parseInt(uuid.slice(14, 18), 16)) >>> 8,
        v & 255,
        (v = parseInt(uuid.slice(19, 23), 16)) >>> 8,
        v & 255,
        ((v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776) & 255,
        (v / 4294967296) & 255,
        (v >>> 24) & 255,
        (v >>> 16) & 255,
        (v >>> 8) & 255,
        v & 255,
      );
    }
    exports2.default = parse;
  },
});

// node_modules/uuid/dist/cjs/stringify.js
var require_stringify = __commonJS({
  "node_modules/uuid/dist/cjs/stringify.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.unsafeStringify = void 0;
    var validate_js_1 = require_validate();
    var byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
    function unsafeStringify(arr, offset = 0) {
      return (
        byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        "-" +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        "-" +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        "-" +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        "-" +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]
      ).toLowerCase();
    }
    exports2.unsafeStringify = unsafeStringify;
    function stringify(arr, offset = 0) {
      const uuid = unsafeStringify(arr, offset);
      if (!(0, validate_js_1.default)(uuid)) {
        throw TypeError("Stringified UUID is invalid");
      }
      return uuid;
    }
    exports2.default = stringify;
  },
});

// node_modules/uuid/dist/cjs/rng.js
var require_rng = __commonJS({
  "node_modules/uuid/dist/cjs/rng.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var crypto_1 = require("crypto");
    var rnds8Pool = new Uint8Array(256);
    var poolPtr = rnds8Pool.length;
    function rng() {
      if (poolPtr > rnds8Pool.length - 16) {
        (0, crypto_1.randomFillSync)(rnds8Pool);
        poolPtr = 0;
      }
      return rnds8Pool.slice(poolPtr, (poolPtr += 16));
    }
    exports2.default = rng;
  },
});

// node_modules/uuid/dist/cjs/v1.js
var require_v1 = __commonJS({
  "node_modules/uuid/dist/cjs/v1.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.updateV1State = void 0;
    var rng_js_1 = require_rng();
    var stringify_js_1 = require_stringify();
    var _state = {};
    function v1(options, buf, offset) {
      let bytes;
      const isV6 = options?._v6 ?? false;
      if (options) {
        const optionsKeys = Object.keys(options);
        if (optionsKeys.length === 1 && optionsKeys[0] === "_v6") {
          options = void 0;
        }
      }
      if (options) {
        bytes = v1Bytes(
          options.random ?? options.rng?.() ?? (0, rng_js_1.default)(),
          options.msecs,
          options.nsecs,
          options.clockseq,
          options.node,
          buf,
          offset,
        );
      } else {
        const now = Date.now();
        const rnds = (0, rng_js_1.default)();
        updateV1State(_state, now, rnds);
        bytes = v1Bytes(
          rnds,
          _state.msecs,
          _state.nsecs,
          isV6 ? void 0 : _state.clockseq,
          isV6 ? void 0 : _state.node,
          buf,
          offset,
        );
      }
      return buf ?? (0, stringify_js_1.unsafeStringify)(bytes);
    }
    function updateV1State(state, now, rnds) {
      state.msecs ??= -Infinity;
      state.nsecs ??= 0;
      if (now === state.msecs) {
        state.nsecs++;
        if (state.nsecs >= 1e4) {
          state.node = void 0;
          state.nsecs = 0;
        }
      } else if (now > state.msecs) {
        state.nsecs = 0;
      } else if (now < state.msecs) {
        state.node = void 0;
      }
      if (!state.node) {
        state.node = rnds.slice(10, 16);
        state.node[0] |= 1;
        state.clockseq = ((rnds[8] << 8) | rnds[9]) & 16383;
      }
      state.msecs = now;
      return state;
    }
    exports2.updateV1State = updateV1State;
    function v1Bytes(rnds, msecs, nsecs, clockseq, node, buf, offset = 0) {
      if (rnds.length < 16) {
        throw new Error("Random bytes length must be >= 16");
      }
      if (!buf) {
        buf = new Uint8Array(16);
        offset = 0;
      } else {
        if (offset < 0 || offset + 16 > buf.length) {
          throw new RangeError(
            `UUID byte range ${offset}:${offset + 15} is out of buffer bounds`,
          );
        }
      }
      msecs ??= Date.now();
      nsecs ??= 0;
      clockseq ??= ((rnds[8] << 8) | rnds[9]) & 16383;
      node ??= rnds.slice(10, 16);
      msecs += 122192928e5;
      const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
      buf[offset++] = (tl >>> 24) & 255;
      buf[offset++] = (tl >>> 16) & 255;
      buf[offset++] = (tl >>> 8) & 255;
      buf[offset++] = tl & 255;
      const tmh = ((msecs / 4294967296) * 1e4) & 268435455;
      buf[offset++] = (tmh >>> 8) & 255;
      buf[offset++] = tmh & 255;
      buf[offset++] = ((tmh >>> 24) & 15) | 16;
      buf[offset++] = (tmh >>> 16) & 255;
      buf[offset++] = (clockseq >>> 8) | 128;
      buf[offset++] = clockseq & 255;
      for (let n = 0; n < 6; ++n) {
        buf[offset++] = node[n];
      }
      return buf;
    }
    exports2.default = v1;
  },
});

// node_modules/uuid/dist/cjs/v1ToV6.js
var require_v1ToV6 = __commonJS({
  "node_modules/uuid/dist/cjs/v1ToV6.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var parse_js_1 = require_parse();
    var stringify_js_1 = require_stringify();
    function v1ToV6(uuid) {
      const v1Bytes =
        typeof uuid === "string" ? (0, parse_js_1.default)(uuid) : uuid;
      const v6Bytes = _v1ToV6(v1Bytes);
      return typeof uuid === "string"
        ? (0, stringify_js_1.unsafeStringify)(v6Bytes)
        : v6Bytes;
    }
    exports2.default = v1ToV6;
    function _v1ToV6(v1Bytes) {
      return Uint8Array.of(
        ((v1Bytes[6] & 15) << 4) | ((v1Bytes[7] >> 4) & 15),
        ((v1Bytes[7] & 15) << 4) | ((v1Bytes[4] & 240) >> 4),
        ((v1Bytes[4] & 15) << 4) | ((v1Bytes[5] & 240) >> 4),
        ((v1Bytes[5] & 15) << 4) | ((v1Bytes[0] & 240) >> 4),
        ((v1Bytes[0] & 15) << 4) | ((v1Bytes[1] & 240) >> 4),
        ((v1Bytes[1] & 15) << 4) | ((v1Bytes[2] & 240) >> 4),
        96 | (v1Bytes[2] & 15),
        v1Bytes[3],
        v1Bytes[8],
        v1Bytes[9],
        v1Bytes[10],
        v1Bytes[11],
        v1Bytes[12],
        v1Bytes[13],
        v1Bytes[14],
        v1Bytes[15],
      );
    }
  },
});

// node_modules/uuid/dist/cjs/md5.js
var require_md5 = __commonJS({
  "node_modules/uuid/dist/cjs/md5.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var crypto_1 = require("crypto");
    function md5(bytes) {
      if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
      } else if (typeof bytes === "string") {
        bytes = Buffer.from(bytes, "utf8");
      }
      return (0, crypto_1.createHash)("md5").update(bytes).digest();
    }
    exports2.default = md5;
  },
});

// node_modules/uuid/dist/cjs/v35.js
var require_v35 = __commonJS({
  "node_modules/uuid/dist/cjs/v35.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.URL = exports2.DNS = exports2.stringToBytes = void 0;
    var parse_js_1 = require_parse();
    var stringify_js_1 = require_stringify();
    function stringToBytes(str) {
      str = unescape(encodeURIComponent(str));
      const bytes = new Uint8Array(str.length);
      for (let i = 0; i < str.length; ++i) {
        bytes[i] = str.charCodeAt(i);
      }
      return bytes;
    }
    exports2.stringToBytes = stringToBytes;
    exports2.DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    exports2.URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
    function v35(version, hash, value, namespace, buf, offset) {
      const valueBytes =
        typeof value === "string" ? stringToBytes(value) : value;
      const namespaceBytes =
        typeof namespace === "string"
          ? (0, parse_js_1.default)(namespace)
          : namespace;
      if (typeof namespace === "string") {
        namespace = (0, parse_js_1.default)(namespace);
      }
      if (namespace?.length !== 16) {
        throw TypeError(
          "Namespace must be array-like (16 iterable integer values, 0-255)",
        );
      }
      let bytes = new Uint8Array(16 + valueBytes.length);
      bytes.set(namespaceBytes);
      bytes.set(valueBytes, namespaceBytes.length);
      bytes = hash(bytes);
      bytes[6] = (bytes[6] & 15) | version;
      bytes[8] = (bytes[8] & 63) | 128;
      if (buf) {
        offset = offset || 0;
        for (let i = 0; i < 16; ++i) {
          buf[offset + i] = bytes[i];
        }
        return buf;
      }
      return (0, stringify_js_1.unsafeStringify)(bytes);
    }
    exports2.default = v35;
  },
});

// node_modules/uuid/dist/cjs/v3.js
var require_v3 = __commonJS({
  "node_modules/uuid/dist/cjs/v3.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.URL = exports2.DNS = void 0;
    var md5_js_1 = require_md5();
    var v35_js_1 = require_v35();
    var v35_js_2 = require_v35();
    Object.defineProperty(exports2, "DNS", {
      enumerable: true,
      get: function () {
        return v35_js_2.DNS;
      },
    });
    Object.defineProperty(exports2, "URL", {
      enumerable: true,
      get: function () {
        return v35_js_2.URL;
      },
    });
    function v3(value, namespace, buf, offset) {
      return (0, v35_js_1.default)(
        48,
        md5_js_1.default,
        value,
        namespace,
        buf,
        offset,
      );
    }
    v3.DNS = v35_js_1.DNS;
    v3.URL = v35_js_1.URL;
    exports2.default = v3;
  },
});

// node_modules/uuid/dist/cjs/native.js
var require_native = __commonJS({
  "node_modules/uuid/dist/cjs/native.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var crypto_1 = require("crypto");
    exports2.default = { randomUUID: crypto_1.randomUUID };
  },
});

// node_modules/uuid/dist/cjs/v4.js
var require_v4 = __commonJS({
  "node_modules/uuid/dist/cjs/v4.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var native_js_1 = require_native();
    var rng_js_1 = require_rng();
    var stringify_js_1 = require_stringify();
    function v4(options, buf, offset) {
      if (native_js_1.default.randomUUID && !buf && !options) {
        return native_js_1.default.randomUUID();
      }
      options = options || {};
      const rnds = options.random ?? options.rng?.() ?? (0, rng_js_1.default)();
      if (rnds.length < 16) {
        throw new Error("Random bytes length must be >= 16");
      }
      rnds[6] = (rnds[6] & 15) | 64;
      rnds[8] = (rnds[8] & 63) | 128;
      if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
          throw new RangeError(
            `UUID byte range ${offset}:${offset + 15} is out of buffer bounds`,
          );
        }
        for (let i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }
        return buf;
      }
      return (0, stringify_js_1.unsafeStringify)(rnds);
    }
    exports2.default = v4;
  },
});

// node_modules/uuid/dist/cjs/sha1.js
var require_sha1 = __commonJS({
  "node_modules/uuid/dist/cjs/sha1.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var crypto_1 = require("crypto");
    function sha1(bytes) {
      if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
      } else if (typeof bytes === "string") {
        bytes = Buffer.from(bytes, "utf8");
      }
      return (0, crypto_1.createHash)("sha1").update(bytes).digest();
    }
    exports2.default = sha1;
  },
});

// node_modules/uuid/dist/cjs/v5.js
var require_v5 = __commonJS({
  "node_modules/uuid/dist/cjs/v5.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.URL = exports2.DNS = void 0;
    var sha1_js_1 = require_sha1();
    var v35_js_1 = require_v35();
    var v35_js_2 = require_v35();
    Object.defineProperty(exports2, "DNS", {
      enumerable: true,
      get: function () {
        return v35_js_2.DNS;
      },
    });
    Object.defineProperty(exports2, "URL", {
      enumerable: true,
      get: function () {
        return v35_js_2.URL;
      },
    });
    function v5(value, namespace, buf, offset) {
      return (0, v35_js_1.default)(
        80,
        sha1_js_1.default,
        value,
        namespace,
        buf,
        offset,
      );
    }
    v5.DNS = v35_js_1.DNS;
    v5.URL = v35_js_1.URL;
    exports2.default = v5;
  },
});

// node_modules/uuid/dist/cjs/v6.js
var require_v6 = __commonJS({
  "node_modules/uuid/dist/cjs/v6.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stringify_js_1 = require_stringify();
    var v1_js_1 = require_v1();
    var v1ToV6_js_1 = require_v1ToV6();
    function v6(options, buf, offset) {
      options ??= {};
      offset ??= 0;
      let bytes = (0, v1_js_1.default)(
        { ...options, _v6: true },
        new Uint8Array(16),
      );
      bytes = (0, v1ToV6_js_1.default)(bytes);
      if (buf) {
        for (let i = 0; i < 16; i++) {
          buf[offset + i] = bytes[i];
        }
        return buf;
      }
      return (0, stringify_js_1.unsafeStringify)(bytes);
    }
    exports2.default = v6;
  },
});

// node_modules/uuid/dist/cjs/v6ToV1.js
var require_v6ToV1 = __commonJS({
  "node_modules/uuid/dist/cjs/v6ToV1.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var parse_js_1 = require_parse();
    var stringify_js_1 = require_stringify();
    function v6ToV1(uuid) {
      const v6Bytes =
        typeof uuid === "string" ? (0, parse_js_1.default)(uuid) : uuid;
      const v1Bytes = _v6ToV1(v6Bytes);
      return typeof uuid === "string"
        ? (0, stringify_js_1.unsafeStringify)(v1Bytes)
        : v1Bytes;
    }
    exports2.default = v6ToV1;
    function _v6ToV1(v6Bytes) {
      return Uint8Array.of(
        ((v6Bytes[3] & 15) << 4) | ((v6Bytes[4] >> 4) & 15),
        ((v6Bytes[4] & 15) << 4) | ((v6Bytes[5] & 240) >> 4),
        ((v6Bytes[5] & 15) << 4) | (v6Bytes[6] & 15),
        v6Bytes[7],
        ((v6Bytes[1] & 15) << 4) | ((v6Bytes[2] & 240) >> 4),
        ((v6Bytes[2] & 15) << 4) | ((v6Bytes[3] & 240) >> 4),
        16 | ((v6Bytes[0] & 240) >> 4),
        ((v6Bytes[0] & 15) << 4) | ((v6Bytes[1] & 240) >> 4),
        v6Bytes[8],
        v6Bytes[9],
        v6Bytes[10],
        v6Bytes[11],
        v6Bytes[12],
        v6Bytes[13],
        v6Bytes[14],
        v6Bytes[15],
      );
    }
  },
});

// node_modules/uuid/dist/cjs/v7.js
var require_v7 = __commonJS({
  "node_modules/uuid/dist/cjs/v7.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.updateV7State = void 0;
    var rng_js_1 = require_rng();
    var stringify_js_1 = require_stringify();
    var _state = {};
    function v7(options, buf, offset) {
      let bytes;
      if (options) {
        bytes = v7Bytes(
          options.random ?? options.rng?.() ?? (0, rng_js_1.default)(),
          options.msecs,
          options.seq,
          buf,
          offset,
        );
      } else {
        const now = Date.now();
        const rnds = (0, rng_js_1.default)();
        updateV7State(_state, now, rnds);
        bytes = v7Bytes(rnds, _state.msecs, _state.seq, buf, offset);
      }
      return buf ?? (0, stringify_js_1.unsafeStringify)(bytes);
    }
    function updateV7State(state, now, rnds) {
      state.msecs ??= -Infinity;
      state.seq ??= 0;
      if (now > state.msecs) {
        state.seq =
          (rnds[6] << 23) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
        state.msecs = now;
      } else {
        state.seq = (state.seq + 1) | 0;
        if (state.seq === 0) {
          state.msecs++;
        }
      }
      return state;
    }
    exports2.updateV7State = updateV7State;
    function v7Bytes(rnds, msecs, seq, buf, offset = 0) {
      if (rnds.length < 16) {
        throw new Error("Random bytes length must be >= 16");
      }
      if (!buf) {
        buf = new Uint8Array(16);
        offset = 0;
      } else {
        if (offset < 0 || offset + 16 > buf.length) {
          throw new RangeError(
            `UUID byte range ${offset}:${offset + 15} is out of buffer bounds`,
          );
        }
      }
      msecs ??= Date.now();
      seq ??=
        ((rnds[6] * 127) << 24) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
      buf[offset++] = (msecs / 1099511627776) & 255;
      buf[offset++] = (msecs / 4294967296) & 255;
      buf[offset++] = (msecs / 16777216) & 255;
      buf[offset++] = (msecs / 65536) & 255;
      buf[offset++] = (msecs / 256) & 255;
      buf[offset++] = msecs & 255;
      buf[offset++] = 112 | ((seq >>> 28) & 15);
      buf[offset++] = (seq >>> 20) & 255;
      buf[offset++] = 128 | ((seq >>> 14) & 63);
      buf[offset++] = (seq >>> 6) & 255;
      buf[offset++] = ((seq << 2) & 255) | (rnds[10] & 3);
      buf[offset++] = rnds[11];
      buf[offset++] = rnds[12];
      buf[offset++] = rnds[13];
      buf[offset++] = rnds[14];
      buf[offset++] = rnds[15];
      return buf;
    }
    exports2.default = v7;
  },
});

// node_modules/uuid/dist/cjs/version.js
var require_version = __commonJS({
  "node_modules/uuid/dist/cjs/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var validate_js_1 = require_validate();
    function version(uuid) {
      if (!(0, validate_js_1.default)(uuid)) {
        throw TypeError("Invalid UUID");
      }
      return parseInt(uuid.slice(14, 15), 16);
    }
    exports2.default = version;
  },
});

// node_modules/uuid/dist/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/uuid/dist/cjs/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.version =
      exports2.validate =
      exports2.v7 =
      exports2.v6ToV1 =
      exports2.v6 =
      exports2.v5 =
      exports2.v4 =
      exports2.v3 =
      exports2.v1ToV6 =
      exports2.v1 =
      exports2.stringify =
      exports2.parse =
      exports2.NIL =
      exports2.MAX =
        void 0;
    var max_js_1 = require_max();
    Object.defineProperty(exports2, "MAX", {
      enumerable: true,
      get: function () {
        return max_js_1.default;
      },
    });
    var nil_js_1 = require_nil();
    Object.defineProperty(exports2, "NIL", {
      enumerable: true,
      get: function () {
        return nil_js_1.default;
      },
    });
    var parse_js_1 = require_parse();
    Object.defineProperty(exports2, "parse", {
      enumerable: true,
      get: function () {
        return parse_js_1.default;
      },
    });
    var stringify_js_1 = require_stringify();
    Object.defineProperty(exports2, "stringify", {
      enumerable: true,
      get: function () {
        return stringify_js_1.default;
      },
    });
    var v1_js_1 = require_v1();
    Object.defineProperty(exports2, "v1", {
      enumerable: true,
      get: function () {
        return v1_js_1.default;
      },
    });
    var v1ToV6_js_1 = require_v1ToV6();
    Object.defineProperty(exports2, "v1ToV6", {
      enumerable: true,
      get: function () {
        return v1ToV6_js_1.default;
      },
    });
    var v3_js_1 = require_v3();
    Object.defineProperty(exports2, "v3", {
      enumerable: true,
      get: function () {
        return v3_js_1.default;
      },
    });
    var v4_js_1 = require_v4();
    Object.defineProperty(exports2, "v4", {
      enumerable: true,
      get: function () {
        return v4_js_1.default;
      },
    });
    var v5_js_1 = require_v5();
    Object.defineProperty(exports2, "v5", {
      enumerable: true,
      get: function () {
        return v5_js_1.default;
      },
    });
    var v6_js_1 = require_v6();
    Object.defineProperty(exports2, "v6", {
      enumerable: true,
      get: function () {
        return v6_js_1.default;
      },
    });
    var v6ToV1_js_1 = require_v6ToV1();
    Object.defineProperty(exports2, "v6ToV1", {
      enumerable: true,
      get: function () {
        return v6ToV1_js_1.default;
      },
    });
    var v7_js_1 = require_v7();
    Object.defineProperty(exports2, "v7", {
      enumerable: true,
      get: function () {
        return v7_js_1.default;
      },
    });
    var validate_js_1 = require_validate();
    Object.defineProperty(exports2, "validate", {
      enumerable: true,
      get: function () {
        return validate_js_1.default;
      },
    });
    var version_js_1 = require_version();
    Object.defineProperty(exports2, "version", {
      enumerable: true,
      get: function () {
        return version_js_1.default;
      },
    });
  },
});

// node_modules/@aws-amplify/platform-core/lib/usage-data/account_id_fetcher.js
var require_account_id_fetcher = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/usage-data/account_id_fetcher.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AccountIdFetcher = void 0;
    var client_sts_1 = require("@aws-sdk/client-sts");
    var uuid_1 = require_cjs();
    var NO_ACCOUNT_ID = "NO_ACCOUNT_ID";
    var AMPLIFY_CLI_UUID_NAMESPACE = "283cae3e-c611-4659-9044-6796e5d696ec";
    var AccountIdFetcher = class {
      stsClient;
      accountId;
      /**
       * constructor for AccountIdFetcher
       */
      constructor(stsClient = new client_sts_1.STSClient()) {
        this.stsClient = stsClient;
      }
      fetch = async () => {
        if (this.accountId) {
          return this.accountId;
        }
        try {
          const stsResponse = await this.stsClient.send(
            new client_sts_1.GetCallerIdentityCommand({}),
          );
          if (stsResponse && stsResponse.Account) {
            const accountIdBucket = stsResponse.Account.slice(0, -2);
            this.accountId = (0, uuid_1.v5)(
              accountIdBucket,
              AMPLIFY_CLI_UUID_NAMESPACE,
            );
            return this.accountId;
          }
          return NO_ACCOUNT_ID;
        } catch {
          return NO_ACCOUNT_ID;
        }
      };
    };
    exports2.AccountIdFetcher = AccountIdFetcher;
  },
});

// node_modules/@aws-amplify/platform-core/lib/usage-data/get_installation_id.js
var require_get_installation_id = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/usage-data/get_installation_id.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getInstallationUuid = void 0;
    var uuid_1 = require_cjs();
    var os_1 = require("os");
    var AMPLIFY_CLI_UUID_NAMESPACE = "e7368840-2eb6-4042-99b4-9d6c2a9370e6";
    var getInstallationUuid = (namespace = AMPLIFY_CLI_UUID_NAMESPACE) => {
      return (0, uuid_1.v5)(__dirname + (0, os_1.hostname)(), namespace);
    };
    exports2.getInstallationUuid = getInstallationUuid;
  },
});

// node_modules/@aws-amplify/platform-core/lib/usage-data/constants.js
var require_constants = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/usage-data/constants.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.USAGE_DATA_TRACKING_ENABLED =
      exports2.latestPayloadVersion =
      exports2.latestApiVersion =
        void 0;
    exports2.latestApiVersion = "v1.0";
    exports2.latestPayloadVersion = "1.1.0";
    exports2.USAGE_DATA_TRACKING_ENABLED = "telemetry.enabled";
  },
});

// node_modules/@aws-amplify/platform-core/lib/usage-data/get_usage_data_url.js
var require_get_usage_data_url = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/usage-data/get_usage_data_url.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getUrl = void 0;
    var node_url_1 = __importDefault(require("node:url"));
    var constants_js_1 = require_constants();
    var cachedUrl;
    var prodUrl = `https://api.cli.amplify.aws/${constants_js_1.latestApiVersion}/metrics`;
    var getUrl = () => {
      if (!cachedUrl) {
        cachedUrl = getParsedUrl();
      }
      return cachedUrl;
    };
    exports2.getUrl = getUrl;
    var getParsedUrl = () => {
      return node_url_1.default.parse(
        process.env.AMPLIFY_BACKEND_USAGE_TRACKING_ENDPOINT || prodUrl,
      );
    };
  },
});

// node_modules/is-ci/node_modules/ci-info/vendors.json
var require_vendors = __commonJS({
  "node_modules/is-ci/node_modules/ci-info/vendors.json"(exports2, module2) {
    module2.exports = [
      {
        name: "Agola CI",
        constant: "AGOLA",
        env: "AGOLA_GIT_REF",
        pr: "AGOLA_PULL_REQUEST_ID",
      },
      {
        name: "Appcircle",
        constant: "APPCIRCLE",
        env: "AC_APPCIRCLE",
        pr: {
          env: "AC_GIT_PR",
          ne: "false",
        },
      },
      {
        name: "AppVeyor",
        constant: "APPVEYOR",
        env: "APPVEYOR",
        pr: "APPVEYOR_PULL_REQUEST_NUMBER",
      },
      {
        name: "AWS CodeBuild",
        constant: "CODEBUILD",
        env: "CODEBUILD_BUILD_ARN",
        pr: {
          env: "CODEBUILD_WEBHOOK_EVENT",
          any: [
            "PULL_REQUEST_CREATED",
            "PULL_REQUEST_UPDATED",
            "PULL_REQUEST_REOPENED",
          ],
        },
      },
      {
        name: "Azure Pipelines",
        constant: "AZURE_PIPELINES",
        env: "TF_BUILD",
        pr: {
          BUILD_REASON: "PullRequest",
        },
      },
      {
        name: "Bamboo",
        constant: "BAMBOO",
        env: "bamboo_planKey",
      },
      {
        name: "Bitbucket Pipelines",
        constant: "BITBUCKET",
        env: "BITBUCKET_COMMIT",
        pr: "BITBUCKET_PR_ID",
      },
      {
        name: "Bitrise",
        constant: "BITRISE",
        env: "BITRISE_IO",
        pr: "BITRISE_PULL_REQUEST",
      },
      {
        name: "Buddy",
        constant: "BUDDY",
        env: "BUDDY_WORKSPACE_ID",
        pr: "BUDDY_EXECUTION_PULL_REQUEST_ID",
      },
      {
        name: "Buildkite",
        constant: "BUILDKITE",
        env: "BUILDKITE",
        pr: {
          env: "BUILDKITE_PULL_REQUEST",
          ne: "false",
        },
      },
      {
        name: "CircleCI",
        constant: "CIRCLE",
        env: "CIRCLECI",
        pr: "CIRCLE_PULL_REQUEST",
      },
      {
        name: "Cirrus CI",
        constant: "CIRRUS",
        env: "CIRRUS_CI",
        pr: "CIRRUS_PR",
      },
      {
        name: "Cloudflare Pages",
        constant: "CLOUDFLARE_PAGES",
        env: "CF_PAGES",
      },
      {
        name: "Codefresh",
        constant: "CODEFRESH",
        env: "CF_BUILD_ID",
        pr: {
          any: ["CF_PULL_REQUEST_NUMBER", "CF_PULL_REQUEST_ID"],
        },
      },
      {
        name: "Codemagic",
        constant: "CODEMAGIC",
        env: "CM_BUILD_ID",
        pr: "CM_PULL_REQUEST",
      },
      {
        name: "Codeship",
        constant: "CODESHIP",
        env: {
          CI_NAME: "codeship",
        },
      },
      {
        name: "Drone",
        constant: "DRONE",
        env: "DRONE",
        pr: {
          DRONE_BUILD_EVENT: "pull_request",
        },
      },
      {
        name: "dsari",
        constant: "DSARI",
        env: "DSARI",
      },
      {
        name: "Earthly",
        constant: "EARTHLY",
        env: "EARTHLY_CI",
      },
      {
        name: "Expo Application Services",
        constant: "EAS",
        env: "EAS_BUILD",
      },
      {
        name: "Gerrit",
        constant: "GERRIT",
        env: "GERRIT_PROJECT",
      },
      {
        name: "Gitea Actions",
        constant: "GITEA_ACTIONS",
        env: "GITEA_ACTIONS",
      },
      {
        name: "GitHub Actions",
        constant: "GITHUB_ACTIONS",
        env: "GITHUB_ACTIONS",
        pr: {
          GITHUB_EVENT_NAME: "pull_request",
        },
      },
      {
        name: "GitLab CI",
        constant: "GITLAB",
        env: "GITLAB_CI",
        pr: "CI_MERGE_REQUEST_ID",
      },
      {
        name: "GoCD",
        constant: "GOCD",
        env: "GO_PIPELINE_LABEL",
      },
      {
        name: "Google Cloud Build",
        constant: "GOOGLE_CLOUD_BUILD",
        env: "BUILDER_OUTPUT",
      },
      {
        name: "Harness CI",
        constant: "HARNESS",
        env: "HARNESS_BUILD_ID",
      },
      {
        name: "Heroku",
        constant: "HEROKU",
        env: {
          env: "NODE",
          includes: "/app/.heroku/node/bin/node",
        },
      },
      {
        name: "Hudson",
        constant: "HUDSON",
        env: "HUDSON_URL",
      },
      {
        name: "Jenkins",
        constant: "JENKINS",
        env: ["JENKINS_URL", "BUILD_ID"],
        pr: {
          any: ["ghprbPullId", "CHANGE_ID"],
        },
      },
      {
        name: "LayerCI",
        constant: "LAYERCI",
        env: "LAYERCI",
        pr: "LAYERCI_PULL_REQUEST",
      },
      {
        name: "Magnum CI",
        constant: "MAGNUM",
        env: "MAGNUM",
      },
      {
        name: "Netlify CI",
        constant: "NETLIFY",
        env: "NETLIFY",
        pr: {
          env: "PULL_REQUEST",
          ne: "false",
        },
      },
      {
        name: "Nevercode",
        constant: "NEVERCODE",
        env: "NEVERCODE",
        pr: {
          env: "NEVERCODE_PULL_REQUEST",
          ne: "false",
        },
      },
      {
        name: "Prow",
        constant: "PROW",
        env: "PROW_JOB_ID",
      },
      {
        name: "ReleaseHub",
        constant: "RELEASEHUB",
        env: "RELEASE_BUILD_ID",
      },
      {
        name: "Render",
        constant: "RENDER",
        env: "RENDER",
        pr: {
          IS_PULL_REQUEST: "true",
        },
      },
      {
        name: "Sail CI",
        constant: "SAIL",
        env: "SAILCI",
        pr: "SAIL_PULL_REQUEST_NUMBER",
      },
      {
        name: "Screwdriver",
        constant: "SCREWDRIVER",
        env: "SCREWDRIVER",
        pr: {
          env: "SD_PULL_REQUEST",
          ne: "false",
        },
      },
      {
        name: "Semaphore",
        constant: "SEMAPHORE",
        env: "SEMAPHORE",
        pr: "PULL_REQUEST_NUMBER",
      },
      {
        name: "Sourcehut",
        constant: "SOURCEHUT",
        env: {
          CI_NAME: "sourcehut",
        },
      },
      {
        name: "Strider CD",
        constant: "STRIDER",
        env: "STRIDER",
      },
      {
        name: "TaskCluster",
        constant: "TASKCLUSTER",
        env: ["TASK_ID", "RUN_ID"],
      },
      {
        name: "TeamCity",
        constant: "TEAMCITY",
        env: "TEAMCITY_VERSION",
      },
      {
        name: "Travis CI",
        constant: "TRAVIS",
        env: "TRAVIS",
        pr: {
          env: "TRAVIS_PULL_REQUEST",
          ne: "false",
        },
      },
      {
        name: "Vela",
        constant: "VELA",
        env: "VELA",
        pr: {
          VELA_PULL_REQUEST: "1",
        },
      },
      {
        name: "Vercel",
        constant: "VERCEL",
        env: {
          any: ["NOW_BUILDER", "VERCEL"],
        },
        pr: "VERCEL_GIT_PULL_REQUEST_ID",
      },
      {
        name: "Visual Studio App Center",
        constant: "APPCENTER",
        env: "APPCENTER_BUILD_ID",
      },
      {
        name: "Woodpecker",
        constant: "WOODPECKER",
        env: {
          CI: "woodpecker",
        },
        pr: {
          CI_BUILD_EVENT: "pull_request",
        },
      },
      {
        name: "Xcode Cloud",
        constant: "XCODE_CLOUD",
        env: "CI_XCODE_PROJECT",
        pr: "CI_PULL_REQUEST_NUMBER",
      },
      {
        name: "Xcode Server",
        constant: "XCODE_SERVER",
        env: "XCS",
      },
    ];
  },
});

// node_modules/is-ci/node_modules/ci-info/index.js
var require_ci_info = __commonJS({
  "node_modules/is-ci/node_modules/ci-info/index.js"(exports2) {
    "use strict";
    var vendors = require_vendors();
    var env = process.env;
    Object.defineProperty(exports2, "_vendors", {
      value: vendors.map(function (v) {
        return v.constant;
      }),
    });
    exports2.name = null;
    exports2.isPR = null;
    exports2.id = null;
    vendors.forEach(function (vendor) {
      const envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
      const isCI = envs.every(function (obj) {
        return checkEnv(obj);
      });
      exports2[vendor.constant] = isCI;
      if (!isCI) {
        return;
      }
      exports2.name = vendor.name;
      exports2.isPR = checkPR(vendor);
      exports2.id = vendor.constant;
    });
    exports2.isCI = !!(
      env.CI !== "false" && // Bypass all checks if CI env is explicitly set to 'false'
      (env.BUILD_ID || // Jenkins, Cloudbees
        env.BUILD_NUMBER || // Jenkins, TeamCity
        env.CI || // Travis CI, CircleCI, Cirrus CI, Gitlab CI, Appveyor, CodeShip, dsari, Cloudflare Pages
        env.CI_APP_ID || // Appflow
        env.CI_BUILD_ID || // Appflow
        env.CI_BUILD_NUMBER || // Appflow
        env.CI_NAME || // Codeship and others
        env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
        env.RUN_ID || // TaskCluster, dsari
        exports2.name ||
        false)
    );
    function checkEnv(obj) {
      if (typeof obj === "string") return !!env[obj];
      if ("env" in obj) {
        return env[obj.env] && env[obj.env].includes(obj.includes);
      }
      if ("any" in obj) {
        return obj.any.some(function (k) {
          return !!env[k];
        });
      }
      return Object.keys(obj).every(function (k) {
        return env[k] === obj[k];
      });
    }
    function checkPR(vendor) {
      switch (typeof vendor.pr) {
        case "string":
          return !!env[vendor.pr];
        case "object":
          if ("env" in vendor.pr) {
            if ("any" in vendor.pr) {
              return vendor.pr.any.some(function (key) {
                return env[vendor.pr.env] === key;
              });
            } else {
              return (
                vendor.pr.env in env && env[vendor.pr.env] !== vendor.pr.ne
              );
            }
          } else if ("any" in vendor.pr) {
            return vendor.pr.any.some(function (key) {
              return !!env[key];
            });
          } else {
            return checkEnv(vendor.pr);
          }
        default:
          return null;
      }
    }
  },
});

// node_modules/is-ci/index.js
var require_is_ci = __commonJS({
  "node_modules/is-ci/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_ci_info().isCI;
  },
});

// node_modules/@aws-amplify/platform-core/lib/usage-data/serializable_error.js
var require_serializable_error = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/usage-data/serializable_error.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SerializableError = void 0;
    var path_1 = __importDefault(require("path"));
    var url_1 = require("url");
    var os_1 = require("os");
    var SerializableError = class {
      name;
      message;
      details;
      trace;
      // breakdown of filePathRegex:
      // (file:/+)? -> matches optional file url prefix
      // homedir() -> users home directory, replacing \ with /
      // [\\w.\\-_@\\\\/]+ -> matches nested directories and file name
      filePathRegex = new RegExp(
        `(file:/+)?${(0, os_1.homedir)().replaceAll("\\", "/")}[\\w.\\-_@\\\\/]+`,
        "g",
      );
      stackTraceRegex =
        /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
      arnRegex =
        /arn:[a-z0-9][-.a-z0-9]{0,62}:[A-Za-z0-9][A-Za-z0-9_/.-]{0,62}:[A-Za-z0-9_/.-]{0,63}:[A-Za-z0-9_/.-]{0,63}:[A-Za-z0-9][A-Za-z0-9:_/+=,@.-]{0,1023}/g;
      stackRegex = /amplify-[a-zA-Z0-9-]+/g;
      /**
       * constructor for SerializableError
       */
      constructor(error) {
        this.name =
          "code" in error && error.code
            ? this.sanitize(error.code)
            : error.name;
        this.message = this.anonymizePaths(this.sanitize(error.message));
        this.details =
          "details" in error
            ? this.anonymizePaths(this.sanitize(error.details))
            : void 0;
        this.trace = this.extractStackTrace(error);
      }
      extractStackTrace = (error) => {
        const result = [];
        if (error.stack) {
          const stack = error.stack.split("\n");
          stack.forEach((line) => {
            const match = this.stackTraceRegex.exec(line);
            if (match) {
              const [, methodName, file, lineNumber, columnNumber] = match;
              result.push({
                methodName,
                file,
                lineNumber,
                columnNumber,
              });
            }
          });
          const processedPaths = this.processPaths(
            result.map((trace) => trace.file),
          );
          result.forEach((trace, index) => {
            trace.file = processedPaths[index];
          });
        }
        return result;
      };
      anonymizePaths = (str) => {
        let result = str;
        const matches = [...result.matchAll(this.filePathRegex)];
        for (const match of matches) {
          result = result.replace(match[0], this.processPaths([match[0]])[0]);
        }
        return result;
      };
      processPaths = (paths) => {
        return paths.map((tracePath) => {
          let result = tracePath;
          if (this.isURLFilePath(result)) {
            result = (0, url_1.fileURLToPath)(result);
          }
          if (path_1.default.isAbsolute(result)) {
            return path_1.default.relative(process.cwd(), result);
          }
          return result;
        });
      };
      removeARN = (str) => {
        return str?.replace(this.arnRegex, "<escaped ARN>") ?? "";
      };
      removeStackIdentifier = (str) => {
        return str?.replace(this.stackRegex, "<escaped stack>") ?? "";
      };
      sanitize = (str) => {
        let result = str;
        result = this.removeARN(result);
        result = this.removeStackIdentifier(result);
        return result.replaceAll(/["❌]/g, "");
      };
      isURLFilePath = (path) => {
        try {
          new URL(path);
          return path.startsWith("file:");
        } catch {
          return false;
        }
      };
    };
    exports2.SerializableError = SerializableError;
  },
});

// node_modules/@aws-amplify/platform-core/lib/usage-data/usage_data_emitter.js
var require_usage_data_emitter = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/usage-data/usage_data_emitter.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DefaultUsageDataEmitter = void 0;
    var uuid_1 = require_cjs();
    var account_id_fetcher_js_1 = require_account_id_fetcher();
    var os_1 = __importDefault(require("os"));
    var https_1 = __importDefault(require("https"));
    var get_installation_id_js_1 = require_get_installation_id();
    var constants_js_1 = require_constants();
    var get_usage_data_url_js_1 = require_get_usage_data_url();
    var is_ci_1 = __importDefault(require_is_ci());
    var serializable_error_js_1 = require_serializable_error();
    var DefaultUsageDataEmitter = class {
      libraryVersion;
      dependencies;
      sessionUuid;
      url;
      accountIdFetcher;
      dependenciesToReport;
      /**
       * Constructor for UsageDataEmitter
       */
      constructor(
        libraryVersion,
        dependencies,
        sessionUuid = (0, uuid_1.v4)(),
        url = (0, get_usage_data_url_js_1.getUrl)(),
        accountIdFetcher = new account_id_fetcher_js_1.AccountIdFetcher(),
      ) {
        this.libraryVersion = libraryVersion;
        this.dependencies = dependencies;
        this.sessionUuid = sessionUuid;
        this.url = url;
        this.accountIdFetcher = accountIdFetcher;
        const targetDependencies = ["@aws-cdk/toolkit-lib", "aws-cdk-lib"];
        this.dependenciesToReport = this.dependencies?.filter((dependency) =>
          targetDependencies.includes(dependency.name),
        );
      }
      emitSuccess = async (metrics, dimensions) => {
        try {
          const data = await this.getUsageData({
            state: "SUCCEEDED",
            metrics,
            dimensions,
          });
          await this.send(data);
        } catch {}
      };
      emitFailure = async (error, dimensions) => {
        try {
          const data = await this.getUsageData({
            state: "FAILED",
            error,
            dimensions,
          });
          await this.send(data);
        } catch {}
      };
      getUsageData = async (options) => {
        return {
          accountId: await this.accountIdFetcher.fetch(),
          sessionUuid: this.sessionUuid,
          installationUuid: (0, get_installation_id_js_1.getInstallationUuid)(),
          amplifyCliVersion: this.libraryVersion,
          timestamp: /* @__PURE__ */ new Date().toISOString(),
          error: options.error
            ? new serializable_error_js_1.SerializableError(options.error)
            : void 0,
          downstreamException:
            options.error &&
            options.error.cause &&
            options.error.cause instanceof Error
              ? new serializable_error_js_1.SerializableError(
                  options.error.cause,
                )
              : void 0,
          payloadVersion: constants_js_1.latestPayloadVersion,
          osPlatform: os_1.default.platform(),
          osRelease: os_1.default.release(),
          nodeVersion: process.versions.node,
          state: options.state,
          codePathDurations: this.translateMetricsToUsageData(options.metrics),
          input: this.translateDimensionsToUsageData(options.dimensions),
          isCi: is_ci_1.default,
          projectSetting: {
            editor: process.env.npm_config_user_agent,
            details: JSON.stringify(this.dependenciesToReport),
          },
        };
      };
      send = (data) => {
        return new Promise((resolve) => {
          const payload = JSON.stringify(data);
          const req = https_1.default.request({
            hostname: this.url.hostname,
            port: this.url.port,
            path: this.url.path,
            method: "POST",
            headers: {
              "content-type": "application/json",
              "content-length": payload.length,
            },
          });
          req.on("error", () => {});
          req.setTimeout(2e3, () => {
            resolve();
          });
          req.write(payload);
          req.end(() => {
            resolve();
          });
        });
      };
      translateMetricsToUsageData = (metrics) => {
        if (!metrics) return {};
        let totalDuration, platformStartup;
        for (const [name, data] of Object.entries(metrics)) {
          if (name === "totalTime") {
            totalDuration = Math.round(data);
          } else if (name === "synthesisTime") {
            platformStartup = Math.round(data);
          }
        }
        return { totalDuration, platformStartup };
      };
      translateDimensionsToUsageData = (dimensions) => {
        let command = "";
        if (dimensions) {
          for (const [name, data] of Object.entries(dimensions)) {
            if (name === "command") {
              command = data;
            }
          }
        }
        return { command, plugin: "Gen2" };
      };
    };
    exports2.DefaultUsageDataEmitter = DefaultUsageDataEmitter;
  },
});

// node_modules/@aws-amplify/platform-core/lib/usage-data/usage_data_emitter_factory.js
var require_usage_data_emitter_factory = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/usage-data/usage_data_emitter_factory.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UsageDataEmitterFactory = void 0;
    var local_configuration_controller_factory_js_1 =
      require_local_configuration_controller_factory();
    var noop_usage_data_emitter_js_1 = require_noop_usage_data_emitter();
    var usage_data_emitter_js_1 = require_usage_data_emitter();
    var constants_js_1 = require_constants();
    var UsageDataEmitterFactory = class {
      /**
       * Creates UsageDataEmitter for a given library version, usage data tracking preferences
       */
      getInstance = async (libraryVersion, dependencies) => {
        const configController =
          local_configuration_controller_factory_js_1.configControllerFactory.getInstance(
            "usage_data_preferences.json",
          );
        const usageDataTrackingDisabledLocalFile =
          (await configController.get(
            constants_js_1.USAGE_DATA_TRACKING_ENABLED,
          )) === false;
        if (
          process.env.AMPLIFY_DISABLE_TELEMETRY ||
          usageDataTrackingDisabledLocalFile
        ) {
          return new noop_usage_data_emitter_js_1.NoOpUsageDataEmitter();
        }
        return new usage_data_emitter_js_1.DefaultUsageDataEmitter(
          libraryVersion,
          dependencies,
        );
      };
    };
    exports2.UsageDataEmitterFactory = UsageDataEmitterFactory;
  },
});

// node_modules/@aws-amplify/platform-core/lib/config/typed_configuration_file.js
var require_typed_configuration_file = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/config/typed_configuration_file.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ZodSchemaTypedConfigurationFile = void 0;
    var get_config_dir_path_1 = require_get_config_dir_path();
    var path_1 = __importDefault(require("path"));
    var promises_1 = __importDefault(require("fs/promises"));
    var fs_1 = require("fs");
    var ZodSchemaTypedConfigurationFile = class {
      schema;
      defaultValue;
      _fsp;
      _existsSync;
      filePath;
      data;
      /**
       * Creates configuration file with content validation.
       */
      constructor(
        schema,
        fileName,
        defaultValue,
        _fsp = promises_1.default,
        _existsSync = fs_1.existsSync,
      ) {
        this.schema = schema;
        this.defaultValue = defaultValue;
        this._fsp = _fsp;
        this._existsSync = _existsSync;
        this.filePath = path_1.default.join(
          (0, get_config_dir_path_1.getConfigDirPath)(),
          fileName,
        );
      }
      read = async () => {
        if (!this.data) {
          if (this._existsSync(this.filePath)) {
            const fileContent = await this._fsp.readFile(
              this.filePath,
              "utf-8",
            );
            try {
              const jsonParsedContent = JSON.parse(fileContent);
              this.data = this.schema.parse(jsonParsedContent);
            } catch {
              this.data = this.schema.parse(this.defaultValue);
            }
          } else {
            this.data = this.schema.parse(this.defaultValue);
          }
        }
        return this.schema.parse(this.data);
      };
      write = async (data) => {
        await this._fsp.writeFile(this.filePath, JSON.stringify(data, null, 2));
        this.data = data;
      };
      delete = async () => {
        if (this._existsSync(this.filePath)) {
          await this._fsp.unlink(this.filePath);
        }
        this.data = void 0;
      };
    };
    exports2.ZodSchemaTypedConfigurationFile = ZodSchemaTypedConfigurationFile;
  },
});

// node_modules/@aws-amplify/platform-core/lib/config/typed_configuration_file_factory.js
var require_typed_configuration_file_factory = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/config/typed_configuration_file_factory.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.typedConfigurationFileFactory =
      exports2.TypedConfigurationFileFactory = void 0;
    var typed_configuration_file_1 = require_typed_configuration_file();
    var TypedConfigurationFileFactory = class {
      files;
      /**
       * initialized empty map of TypedConfigurationFile;
       */
      constructor() {
        this.files = {};
      }
      /**
       * Returns a TypedConfigurationFile
       */
      getInstance = (fileName, schema, defaultValue) => {
        if (this.files[fileName]) {
          return this.files[fileName];
        }
        this.files[fileName] =
          new typed_configuration_file_1.ZodSchemaTypedConfigurationFile(
            schema,
            fileName,
            defaultValue,
          );
        return this.files[fileName];
      };
    };
    exports2.TypedConfigurationFileFactory = TypedConfigurationFileFactory;
    exports2.typedConfigurationFileFactory =
      new TypedConfigurationFileFactory();
  },
});

// node_modules/@aws-amplify/platform-core/lib/cdk_context_key.js
var require_cdk_context_key = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/cdk_context_key.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CDKContextKey = void 0;
    var CDKContextKey;
    (function (CDKContextKey2) {
      CDKContextKey2["BACKEND_NAME"] = "amplify-backend-name";
      CDKContextKey2["BACKEND_NAMESPACE"] = "amplify-backend-namespace";
      CDKContextKey2["DEPLOYMENT_TYPE"] = "amplify-backend-type";
    })(CDKContextKey || (exports2.CDKContextKey = CDKContextKey = {}));
  },
});

// node_modules/@aws-amplify/platform-core/lib/parameter_path_conversions.js
var require_parameter_path_conversions = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/parameter_path_conversions.js"(
    exports2,
  ) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ParameterPathConversions = void 0;
    var backend_identifier_conversions_js_1 =
      require_backend_identifier_conversions();
    var errors_1 = require_errors();
    var SHARED_SECRET = "shared";
    var RESOURCE_REFERENCE = "resource_reference";
    var ParameterPathConversions2 = class {
      /**
       * Convert a BackendIdentifier to a parameter prefix.
       */
      // It's fine to ignore the rule here because the anti-static rule is to ban the static function which should use constructor
      // eslint-disable-next-line no-restricted-syntax
      static toParameterPrefix(backendId) {
        if (typeof backendId === "object") {
          return getBackendParameterPrefix(backendId);
        }
        return getSharedParameterPrefix(backendId);
      }
      /**
       * Convert a BackendIdentifier to a parameter full path.
       */
      // It's fine to ignore the rule here because the anti-static rule is to ban the static function which should use constructor
      // eslint-disable-next-line no-restricted-syntax
      static toParameterFullPath(backendId, parameterName) {
        if (typeof backendId === "object") {
          return getBackendParameterFullPath(backendId, parameterName);
        }
        return getSharedParameterFullPath(backendId, parameterName);
      }
      /**
       * Generate an SSM path for references to other backend resources
       */
      // It's fine to ignore the rule here because the anti-static rule is to ban the static function which should use constructor
      // eslint-disable-next-line no-restricted-syntax
      static toResourceReferenceFullPath(backendId, referenceName) {
        return `/amplify/${RESOURCE_REFERENCE}/${getBackendIdentifierPathPart(backendId)}/${referenceName}`;
      }
    };
    exports2.ParameterPathConversions = ParameterPathConversions2;
    var getBackendParameterPrefix = (parts) => {
      return `/amplify/${getBackendIdentifierPathPart(parts)}`;
    };
    var getBackendIdentifierPathPart = (parts) => {
      const sanitizedBackendId =
        backend_identifier_conversions_js_1.BackendIdentifierConversions.fromStackName(
          backend_identifier_conversions_js_1.BackendIdentifierConversions.toStackName(
            parts,
          ),
        );
      if (!sanitizedBackendId || !sanitizedBackendId.hash) {
        throw new errors_1.AmplifyFault("BackendIdConversionFault", {
          message: `Could not sanitize the backendId to construct the parameter path`,
        });
      }
      return `${sanitizedBackendId.namespace}/${sanitizedBackendId.name}-${sanitizedBackendId.type}-${sanitizedBackendId.hash}`;
    };
    var getBackendParameterFullPath = (backendIdentifier, parameterName) => {
      return `${getBackendParameterPrefix(backendIdentifier)}/${parameterName}`;
    };
    var getSharedParameterPrefix = (appId) => {
      return `/amplify/${SHARED_SECRET}/${appId}`;
    };
    var getSharedParameterFullPath = (appId, parameterName) => {
      return `${getSharedParameterPrefix(appId)}/${parameterName}`;
    };
  },
});

// node_modules/lodash.mergewith/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.mergewith/index.js"(exports2, module2) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var HOT_COUNT = 800;
    var HOT_SPAN = 16;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var asyncTag = "[object AsyncFunction]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var nullTag = "[object Null]";
    var objectTag = "[object Object]";
    var proxyTag = "[object Proxy]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var undefinedTag = "[object Undefined]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] =
      typedArrayTags[float64Tag] =
      typedArrayTags[int8Tag] =
      typedArrayTags[int16Tag] =
      typedArrayTags[int32Tag] =
      typedArrayTags[uint8Tag] =
      typedArrayTags[uint8ClampedTag] =
      typedArrayTags[uint16Tag] =
      typedArrayTags[uint32Tag] =
        true;
    typedArrayTags[argsTag] =
      typedArrayTags[arrayTag] =
      typedArrayTags[arrayBufferTag] =
      typedArrayTags[boolTag] =
      typedArrayTags[dataViewTag] =
      typedArrayTags[dateTag] =
      typedArrayTags[errorTag] =
      typedArrayTags[funcTag] =
      typedArrayTags[mapTag] =
      typedArrayTags[numberTag] =
      typedArrayTags[objectTag] =
      typedArrayTags[regexpTag] =
      typedArrayTags[setTag] =
      typedArrayTags[stringTag] =
      typedArrayTags[weakMapTag] =
        false;
    var freeGlobal =
      typeof global == "object" && global && global.Object === Object && global;
    var freeSelf =
      typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports =
      typeof exports2 == "object" && exports2 && !exports2.nodeType && exports2;
    var freeModule =
      freeExports &&
      typeof module2 == "object" &&
      module2 &&
      !module2.nodeType &&
      module2;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = (function () {
      try {
        var types =
          freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return (
          freeProcess && freeProcess.binding && freeProcess.binding("util")
        );
      } catch (e) {}
    })();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function baseTimes(n, iteratee) {
      var index = -1,
        result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseUnary(func) {
      return function (value) {
        return func(value);
      };
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function overArg(func, transform) {
      return function (arg) {
        return func(transform(arg));
      };
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var maskSrcKey = (function () {
      var uid = /[^.]+$/.exec(
        (coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO) || "",
      );
      return uid ? "Symbol(src)_1." + uid : "";
    })();
    var nativeObjectToString = objectProto.toString;
    var objectCtorString = funcToString.call(Object);
    var reIsNative = RegExp(
      "^" +
        funcToString
          .call(hasOwnProperty)
          .replace(reRegExpChar, "\\$&")
          .replace(
            /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
            "$1.*?",
          ) +
        "$",
    );
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var Symbol2 = root.Symbol;
    var Uint8Array2 = root.Uint8Array;
    var allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    var objectCreate = Object.create;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var splice = arrayProto.splice;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    var defineProperty = (function () {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {}
    })();
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var nativeMax = Math.max;
    var nativeNow = Date.now;
    var Map2 = getNative(root, "Map");
    var nativeCreate = getNative(Object, "create");
    var baseCreate = /* @__PURE__ */ (function () {
      function object() {}
      return function (proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    })();
    function Hash(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate
        ? data[key] !== void 0
        : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function listCacheDelete(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__,
        index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        hash: new Hash(),
        map: new (Map2 || ListCache)(),
        string: new Hash(),
      };
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
        size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function Stack(entries) {
      var data = (this.__data__ = new ListCache(entries));
      this.size = data.size;
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__,
        result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;
      for (var key in value) {
        if (
          (inherited || hasOwnProperty.call(value, key)) &&
          !(
            skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
            (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
              (isBuff && (key == "offset" || key == "parent")) || // PhantomJS 2 has enumerable non-index properties on typed arrays.
              (isType &&
                (key == "buffer" ||
                  key == "byteLength" ||
                  key == "byteOffset")) || // Skip index properties.
              isIndex(key, length))
          )
        ) {
          result.push(key);
        }
      }
      return result;
    }
    function assignMergeValue(object, key, value) {
      if (
        (value !== void 0 && !eq(object[key], value)) ||
        (value === void 0 && !(key in object))
      ) {
        baseAssignValue(object, key, value);
      }
    }
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (
        !(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
        (value === void 0 && !(key in object))
      ) {
        baseAssignValue(object, key, value);
      }
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          configurable: true,
          enumerable: true,
          value: value,
          writable: true,
        });
      } else {
        object[key] = value;
      }
    }
    var baseFor = createBaseFor();
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value)
        ? getRawTag(value)
        : objectToString(value);
    }
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseIsTypedArray(value) {
      return (
        isObjectLike(value) &&
        isLength(value.length) &&
        !!typedArrayTags[baseGetTag(value)]
      );
    }
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
        result = [];
      for (var key in object) {
        if (
          !(
            key == "constructor" &&
            (isProto || !hasOwnProperty.call(object, key))
          )
        ) {
          result.push(key);
        }
      }
      return result;
    }
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(
        source,
        function (srcValue, key) {
          stack || (stack = new Stack());
          if (isObject(srcValue)) {
            baseMergeDeep(
              object,
              source,
              key,
              srcIndex,
              baseMerge,
              customizer,
              stack,
            );
          } else {
            var newValue = customizer
              ? customizer(
                  safeGet(object, key),
                  srcValue,
                  key + "",
                  object,
                  source,
                  stack,
                )
              : void 0;
            if (newValue === void 0) {
              newValue = srcValue;
            }
            assignMergeValue(object, key, newValue);
          }
        },
        keysIn,
      );
    }
    function baseMergeDeep(
      object,
      source,
      key,
      srcIndex,
      mergeFunc,
      customizer,
      stack,
    ) {
      var objValue = safeGet(object, key),
        srcValue = safeGet(source, key),
        stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer
        ? customizer(objValue, srcValue, key + "", object, source, stack)
        : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray(srcValue),
          isBuff = !isArr && isBuffer(srcValue),
          isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    var baseSetToString = !defineProperty
      ? identity
      : function (func, string) {
          return defineProperty(func, "toString", {
            configurable: true,
            enumerable: false,
            value: constant(string),
            writable: true,
          });
        };
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
        result = allocUnsafe
          ? allocUnsafe(length)
          : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep
        ? cloneArrayBuffer(typedArray.buffer)
        : typedArray.buffer;
      return new typedArray.constructor(
        buffer,
        typedArray.byteOffset,
        typedArray.length,
      );
    }
    function copyArray(source, array) {
      var index = -1,
        length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1,
        length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    function createAssigner(assigner) {
      return baseRest(function (object, sources) {
        var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : void 0,
          guard = length > 2 ? sources[2] : void 0;
        customizer =
          assigner.length > 3 && typeof customizer == "function"
            ? (length--, customizer)
            : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }
    function createBaseFor(fromRight) {
      return function (object, iteratee, keysFunc) {
        var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == "string" ? "string" : "hash"]
        : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {}
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object)
        ? baseCreate(getPrototype(object))
        : {};
    }
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return (
        !!length &&
        (type == "number" || (type != "symbol" && reIsUint.test(value))) &&
        value > -1 &&
        value % 1 == 0 &&
        value < length
      );
    }
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (
        type == "number"
          ? isArrayLike(object) && isIndex(index, object.length)
          : type == "string" && index in object
      ) {
        return eq(object[index], value);
      }
      return false;
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" ||
        type == "number" ||
        type == "symbol" ||
        type == "boolean"
        ? value !== "__proto__"
        : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor,
        proto = (typeof Ctor == "function" && Ctor.prototype) || objectProto;
      return value === proto;
    }
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function () {
        var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    var setToString = shortOut(baseSetToString);
    function shortOut(func) {
      var count = 0,
        lastCalled = 0;
      return function () {
        var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return func + "";
        } catch (e) {}
      }
      return "";
    }
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }
    var isArguments = baseIsArguments(
      /* @__PURE__ */ (function () {
        return arguments;
      })(),
    )
      ? baseIsArguments
      : function (value) {
          return (
            isObjectLike(value) &&
            hasOwnProperty.call(value, "callee") &&
            !propertyIsEnumerable.call(value, "callee")
          );
        };
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return (
        tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag
      );
    }
    function isLength(value) {
      return (
        typeof value == "number" &&
        value > -1 &&
        value % 1 == 0 &&
        value <= MAX_SAFE_INTEGER
      );
    }
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return (
        typeof Ctor == "function" &&
        Ctor instanceof Ctor &&
        funcToString.call(Ctor) == objectCtorString
      );
    }
    var isTypedArray = nodeIsTypedArray
      ? baseUnary(nodeIsTypedArray)
      : baseIsTypedArray;
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    function keysIn(object) {
      return isArrayLike(object)
        ? arrayLikeKeys(object, true)
        : baseKeysIn(object);
    }
    var mergeWith = createAssigner(
      function (object, source, srcIndex, customizer) {
        baseMerge(object, source, srcIndex, customizer);
      },
    );
    function constant(value) {
      return function () {
        return value;
      };
    }
    function identity(value) {
      return value;
    }
    function stubFalse() {
      return false;
    }
    module2.exports = mergeWith;
  },
});

// node_modules/semver/internal/constants.js
var require_constants2 = __commonJS({
  "node_modules/semver/internal/constants.js"(exports2, module2) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER =
      Number.MAX_SAFE_INTEGER /* istanbul ignore next */ || 9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease",
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2,
    };
  },
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports2, module2) {
    var debug =
      typeof process === "object" &&
      process.env &&
      process.env.NODE_DEBUG &&
      /\bsemver\b/i.test(process.env.NODE_DEBUG)
        ? (...args) => console.error("SEMVER", ...args)
        : () => {};
    module2.exports = debug;
  },
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports2, module2) {
    var { MAX_SAFE_COMPONENT_LENGTH, MAX_SAFE_BUILD_LENGTH, MAX_LENGTH } =
      require_constants2();
    var debug = require_debug();
    exports2 = module2.exports = {};
    var re = (exports2.re = []);
    var safeRe = (exports2.safeRe = []);
    var src = (exports2.src = []);
    var safeSrc = (exports2.safeSrc = []);
    var t = (exports2.t = {});
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value
          .split(`${token}*`)
          .join(`${token}{0,${max}}`)
          .split(`${token}+`)
          .join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken(
      "MAINVERSION",
      `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`,
    );
    createToken(
      "MAINVERSIONLOOSE",
      `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`,
    );
    createToken(
      "PRERELEASEIDENTIFIER",
      `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`,
    );
    createToken(
      "PRERELEASEIDENTIFIERLOOSE",
      `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`,
    );
    createToken(
      "PRERELEASE",
      `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`,
    );
    createToken(
      "PRERELEASELOOSE",
      `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`,
    );
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken(
      "BUILD",
      `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`,
    );
    createToken(
      "FULLPLAIN",
      `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`,
    );
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken(
      "LOOSEPLAIN",
      `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`,
    );
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken(
      "XRANGEIDENTIFIERLOOSE",
      `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`,
    );
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken(
      "XRANGEPLAIN",
      `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`,
    );
    createToken(
      "XRANGEPLAINLOOSE",
      `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`,
    );
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken(
      "XRANGELOOSE",
      `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`,
    );
    createToken(
      "COERCEPLAIN",
      `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`,
    );
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken(
      "COERCEFULL",
      src[t.COERCEPLAIN] +
        `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`,
    );
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports2.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken(
      "TILDELOOSE",
      `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`,
    );
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports2.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken(
      "CARETLOOSE",
      `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`,
    );
    createToken(
      "COMPARATORLOOSE",
      `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`,
    );
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken(
      "COMPARATORTRIM",
      `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`,
      true,
    );
    exports2.comparatorTrimReplace = "$1$2$3";
    createToken(
      "HYPHENRANGE",
      `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`,
    );
    createToken(
      "HYPHENRANGELOOSE",
      `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`,
    );
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  },
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports2, module2) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  },
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports2, module2) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b
        ? 0
        : anum && !bnum
          ? -1
          : bnum && !anum
            ? 1
            : a < b
              ? -1
              : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers,
    };
  },
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports2, module2) {
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants2();
    var { safeRe: re, safeSrc: src, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (
            version.loose === !!options.loose &&
            version.includePrerelease === !!options.includePrerelease
          ) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(
            `Invalid version. Must be a string. Got type "${typeof version}".`,
          );
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`,
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version
          .trim()
          .match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        return (
          compareIdentifiers(this.major, other.major) ||
          compareIdentifiers(this.minor, other.minor) ||
          compareIdentifiers(this.patch, other.patch)
        );
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const r = new RegExp(
              `^${this.options.loose ? src[t.PRERELEASELOOSE] : src[t.PRERELEASE]}$`,
            );
            const match = `-${identifier}`.match(r);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (
              this.minor !== 0 ||
              this.patch !== 0 ||
              this.prerelease.length === 0
            ) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (
                  identifier === this.prerelease.join(".") &&
                  identifierBase === false
                ) {
                  throw new Error(
                    "invalid increment argument: identifier already exists",
                  );
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  },
});

// node_modules/semver/functions/parse.js
var require_parse2 = __commonJS({
  "node_modules/semver/functions/parse.js"(exports2, module2) {
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse;
  },
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports2, module2) {
    var parse = require_parse2();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  },
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports2, module2) {
    var parse = require_parse2();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  },
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports2, module2) {
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options,
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  },
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports2, module2) {
    var parse = require_parse2();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  },
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports2, module2) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  },
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports2, module2) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  },
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports2, module2) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  },
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports2, module2) {
    var parse = require_parse2();
    var prerelease = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease;
  },
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports2, module2) {
    var SemVer = require_semver();
    var compare = (a, b, loose) =>
      new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  },
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports2, module2) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  },
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports2, module2) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module2.exports = compareLoose;
  },
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports2, module2) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  },
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports2, module2) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  },
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports2, module2) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  },
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports2, module2) {
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  },
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports2, module2) {
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  },
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports2, module2) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  },
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports2, module2) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  },
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports2, module2) {
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  },
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports2, module2) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  },
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports2, module2) {
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  },
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports2, module2) {
    var SemVer = require_semver();
    var parse = require_parse2();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(
          options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE],
        );
      } else {
        const coerceRtlRegex = options.includePrerelease
          ? re[t.COERCERTLFULL]
          : re[t.COERCERTL];
        let next;
        while (
          (next = coerceRtlRegex.exec(version)) &&
          (!match || match.index + match[0].length !== version.length)
        ) {
          if (
            !match ||
            next.index + next[0].length !== match.index + match[0].length
          ) {
            match = next;
          }
          coerceRtlRegex.lastIndex =
            next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease =
        options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module2.exports = coerce;
  },
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports2, module2) {
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module2.exports = LRUCache;
  },
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports2, module2) {
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (
            range.loose === !!options.loose &&
            range.includePrerelease === !!options.includePrerelease
          ) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw
          .split("||")
          .map((r) => this.parseRange(r.trim()))
          .filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts =
          (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
          (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(
          hr,
          hyphenReplace(this.options.includePrerelease),
        );
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range
          .split(" ")
          .map((comp) => parseComparator(comp, this.options))
          .join(" ")
          .split(/\s+/)
          .map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map(
          (comp) => new Comparator(comp, this.options),
        );
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return (
            isSatisfiable(thisComparators, options) &&
            range.set.some((rangeComparators) => {
              return (
                isSatisfiable(rangeComparators, options) &&
                thisComparators.every((thisComparator) => {
                  return rangeComparators.every((rangeComparator) => {
                    return thisComparator.intersects(rangeComparator, options);
                  });
                })
              );
            })
          );
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace,
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants2();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp
        .trim()
        .split(/\s+/)
        .map((c) => replaceTilde(c, options))
        .join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp
        .trim()
        .split(/\s+/)
        .map((c) => replaceCaret(c, options))
        .join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp
        .split(/\s+/)
        .map((c) => replaceXRange(c, options))
        .join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp
        .trim()
        .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace =
      (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
        if (isX(fM)) {
          from = "";
        } else if (isX(fm)) {
          from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
        } else if (isX(fp)) {
          from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
        } else if (fpr) {
          from = `>=${from}`;
        } else {
          from = `>=${from}${incPr ? "-0" : ""}`;
        }
        if (isX(tM)) {
          to = "";
        } else if (isX(tm)) {
          to = `<${+tM + 1}.0.0-0`;
        } else if (isX(tp)) {
          to = `<${tM}.${+tm + 1}.0-0`;
        } else if (tpr) {
          to = `<=${tM}.${tm}.${tp}-${tpr}`;
        } else if (incPr) {
          to = `<${tM}.${tm}.${+tp + 1}-0`;
        } else {
          to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
      };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (
              allowed.major === version.major &&
              allowed.minor === version.minor &&
              allowed.patch === version.patch
            ) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  },
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports2, module2) {
    var ANY = Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (
          options.includePrerelease &&
          (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")
        ) {
          return false;
        }
        if (
          !options.includePrerelease &&
          (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))
        ) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (
          this.semver.version === comp.semver.version &&
          this.operator.includes("=") &&
          comp.operator.includes("=")
        ) {
          return true;
        }
        if (
          cmp(this.semver, "<", comp.semver, options) &&
          this.operator.startsWith(">") &&
          comp.operator.startsWith("<")
        ) {
          return true;
        }
        if (
          cmp(this.semver, ">", comp.semver, options) &&
          this.operator.startsWith("<") &&
          comp.operator.startsWith(">")
        ) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  },
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports2, module2) {
    var Range = require_range();
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module2.exports = satisfies;
  },
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports2, module2) {
    var Range = require_range();
    var toComparators = (range, options) =>
      new Range(range, options).set.map((comp) =>
        comp
          .map((c) => c.value)
          .join(" ")
          .trim()
          .split(" "),
      );
    module2.exports = toComparators;
  },
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  },
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  },
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports2, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion;
  },
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports2, module2) {
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  },
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports2, module2) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if (
          (!low.operator || low.operator === comp) &&
          ltefn(version, low.semver)
        ) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  },
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports2, module2) {
    var outside = require_outside();
    var gtr = (version, range, options) =>
      outside(version, range, ">", options);
    module2.exports = gtr;
  },
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports2, module2) {
    var outside = require_outside();
    var ltr = (version, range, options) =>
      outside(version, range, "<", options);
    module2.exports = ltr;
  },
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports2, module2) {
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  },
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports2, module2) {
    var satisfies = require_satisfies();
    var compare = require_compare();
    module2.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original =
        typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  },
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports2, module2) {
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (
          gtltComp === 0 &&
          (gt.operator !== ">=" || lt.operator !== "<=")
        ) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre =
        lt && !options.includePrerelease && lt.semver.prerelease.length
          ? lt.semver
          : false;
      let needDomGTPre =
        gt && !options.includePrerelease && gt.semver.prerelease.length
          ? gt.semver
          : false;
      if (
        needDomLTPre &&
        needDomLTPre.prerelease.length === 1 &&
        lt.operator === "<" &&
        needDomLTPre.prerelease[0] === 0
      ) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (
              c.semver.prerelease &&
              c.semver.prerelease.length &&
              c.semver.major === needDomGTPre.major &&
              c.semver.minor === needDomGTPre.minor &&
              c.semver.patch === needDomGTPre.patch
            ) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (
            gt.operator === ">=" &&
            !satisfies(gt.semver, String(c), options)
          ) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (
              c.semver.prerelease &&
              c.semver.prerelease.length &&
              c.semver.major === needDomLTPre.major &&
              c.semver.minor === needDomLTPre.minor &&
              c.semver.patch === needDomLTPre.patch
            ) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (
            lt.operator === "<=" &&
            !satisfies(lt.semver, String(c), options)
          ) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0
        ? a
        : comp < 0
          ? b
          : b.operator === ">" && a.operator === ">="
            ? b
            : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0
        ? a
        : comp > 0
          ? b
          : b.operator === "<" && a.operator === "<="
            ? b
            : a;
    };
    module2.exports = subset;
  },
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports2, module2) {
    var internalRe = require_re();
    var constants = require_constants2();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse2();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers,
    };
  },
});

// node_modules/@aws-amplify/platform-core/lib/object_accumulator.js
var require_object_accumulator = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/object_accumulator.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ObjectAccumulator =
      exports2.ObjectAccumulatorVersionMismatchError =
      exports2.ObjectAccumulatorPropertyAlreadyExistsError =
        void 0;
    var lodash_mergewith_1 = __importDefault(require_lodash());
    var semver_1 = __importDefault(require_semver2());
    var ObjectAccumulatorPropertyAlreadyExistsError = class extends Error {
      key;
      existingValue;
      incomingValue;
      /**
       * Creates property already exists error.
       */
      constructor(key, existingValue, incomingValue) {
        super(`Property ${key} already exists`);
        this.key = key;
        this.existingValue = existingValue;
        this.incomingValue = incomingValue;
      }
    };
    exports2.ObjectAccumulatorPropertyAlreadyExistsError =
      ObjectAccumulatorPropertyAlreadyExistsError;
    var ObjectAccumulatorVersionMismatchError = class extends Error {
      existingVersion;
      newVersion;
      /**
       * Creates property already exists error.
       */
      constructor(existingVersion, newVersion) {
        super(
          `Version mismatch: Cannot accumulate new objects with version ${newVersion} with existing accumulated object with version ${existingVersion}`,
        );
        this.existingVersion = existingVersion;
        this.newVersion = newVersion;
      }
    };
    exports2.ObjectAccumulatorVersionMismatchError =
      ObjectAccumulatorVersionMismatchError;
    var ObjectAccumulator = class {
      accumulator;
      versionKey;
      /**
       * creates object accumulator.
       */
      constructor(accumulator, versionKey = "version") {
        this.accumulator = accumulator;
        this.versionKey = versionKey;
      }
      /**
       * Accumulate a new object part with accumulator.
       * This method throws if there is any intersection between the object parts
       * except for the versionKey, which should be the same across all object parts (nested objects included)
       * @param part a new object part to accumulate
       * @returns the accumulator object for easy chaining
       */
      accumulate = (part) => {
        (0, lodash_mergewith_1.default)(
          this.accumulator,
          part,
          (existingValue, incomingValue, key) => {
            if (Array.isArray(existingValue)) {
              return existingValue.concat(incomingValue);
            }
            if (existingValue && typeof existingValue !== "object") {
              if (key === this.versionKey) {
                const incomingVersion = semver_1.default.coerce(incomingValue);
                const existingVersion = semver_1.default.coerce(existingValue);
                if (incomingVersion && existingVersion) {
                  if (incomingVersion.major !== existingVersion.major) {
                    throw new ObjectAccumulatorVersionMismatchError(
                      existingValue,
                      incomingValue,
                    );
                  } else {
                    return semver_1.default.gte(
                      incomingVersion,
                      existingVersion,
                    )
                      ? incomingValue
                      : existingValue;
                  }
                }
              } else if (key !== this.versionKey) {
                throw new ObjectAccumulatorPropertyAlreadyExistsError(
                  key,
                  existingValue,
                  incomingValue,
                );
              }
            }
            return void 0;
          },
        );
        return this;
      };
      getAccumulatedObject = () => {
        return this.accumulator;
      };
    };
    exports2.ObjectAccumulator = ObjectAccumulator;
  },
});

// node_modules/@aws-amplify/platform-core/lib/tag_name.js
var require_tag_name = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/tag_name.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TagName = void 0;
    var TagName;
    (function (TagName2) {
      TagName2["FRIENDLY_NAME"] = "amplify:friendly-name";
    })(TagName || (exports2.TagName = TagName = {}));
  },
});

// node_modules/lodash.snakecase/index.js
var require_lodash2 = __commonJS({
  "node_modules/lodash.snakecase/index.js"(exports2, module2) {
    var INFINITY = 1 / 0;
    var symbolTag = "[object Symbol]";
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
    var rsComboSymbolsRange = "\\u20d0-\\u20f0";
    var rsDingbatRange = "\\u2700-\\u27bf";
    var rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff";
    var rsMathOpRange = "\\xac\\xb1\\xd7\\xf7";
    var rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
    var rsPunctuationRange = "\\u2000-\\u206f";
    var rsSpaceRange =
      " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
    var rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde";
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsBreakRange =
      rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['\u2019]";
    var rsBreak = "[" + rsBreakRange + "]";
    var rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]";
    var rsDigits = "\\d+";
    var rsDingbat = "[" + rsDingbatRange + "]";
    var rsLower = "[" + rsLowerRange + "]";
    var rsMisc =
      "[^" +
      rsAstralRange +
      rsBreakRange +
      rsDigits +
      rsDingbatRange +
      rsLowerRange +
      rsUpperRange +
      "]";
    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
    var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
    var rsNonAstral = "[^" + rsAstralRange + "]";
    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    var rsUpper = "[" + rsUpperRange + "]";
    var rsZWJ = "\\u200d";
    var rsLowerMisc = "(?:" + rsLower + "|" + rsMisc + ")";
    var rsUpperMisc = "(?:" + rsUpper + "|" + rsMisc + ")";
    var rsOptLowerContr = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?";
    var rsOptUpperContr = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?";
    var reOptMod = rsModifier + "?";
    var rsOptVar = "[" + rsVarRange + "]?";
    var rsOptJoin =
      "(?:" +
      rsZWJ +
      "(?:" +
      [rsNonAstral, rsRegional, rsSurrPair].join("|") +
      ")" +
      rsOptVar +
      reOptMod +
      ")*";
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsEmoji =
      "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq;
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicodeWord = RegExp(
      [
        rsUpper +
          "?" +
          rsLower +
          "+" +
          rsOptLowerContr +
          "(?=" +
          [rsBreak, rsUpper, "$"].join("|") +
          ")",
        rsUpperMisc +
          "+" +
          rsOptUpperContr +
          "(?=" +
          [rsBreak, rsUpper + rsLowerMisc, "$"].join("|") +
          ")",
        rsUpper + "?" + rsLowerMisc + "+" + rsOptLowerContr,
        rsUpper + "+" + rsOptUpperContr,
        rsDigits,
        rsEmoji,
      ].join("|"),
      "g",
    );
    var reHasUnicodeWord =
      /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var deburredLetters = {
      // Latin-1 Supplement block.
      "\xC0": "A",
      "\xC1": "A",
      "\xC2": "A",
      "\xC3": "A",
      "\xC4": "A",
      "\xC5": "A",
      "\xE0": "a",
      "\xE1": "a",
      "\xE2": "a",
      "\xE3": "a",
      "\xE4": "a",
      "\xE5": "a",
      "\xC7": "C",
      "\xE7": "c",
      "\xD0": "D",
      "\xF0": "d",
      "\xC8": "E",
      "\xC9": "E",
      "\xCA": "E",
      "\xCB": "E",
      "\xE8": "e",
      "\xE9": "e",
      "\xEA": "e",
      "\xEB": "e",
      "\xCC": "I",
      "\xCD": "I",
      "\xCE": "I",
      "\xCF": "I",
      "\xEC": "i",
      "\xED": "i",
      "\xEE": "i",
      "\xEF": "i",
      "\xD1": "N",
      "\xF1": "n",
      "\xD2": "O",
      "\xD3": "O",
      "\xD4": "O",
      "\xD5": "O",
      "\xD6": "O",
      "\xD8": "O",
      "\xF2": "o",
      "\xF3": "o",
      "\xF4": "o",
      "\xF5": "o",
      "\xF6": "o",
      "\xF8": "o",
      "\xD9": "U",
      "\xDA": "U",
      "\xDB": "U",
      "\xDC": "U",
      "\xF9": "u",
      "\xFA": "u",
      "\xFB": "u",
      "\xFC": "u",
      "\xDD": "Y",
      "\xFD": "y",
      "\xFF": "y",
      "\xC6": "Ae",
      "\xE6": "ae",
      "\xDE": "Th",
      "\xFE": "th",
      "\xDF": "ss",
      // Latin Extended-A block.
      "\u0100": "A",
      "\u0102": "A",
      "\u0104": "A",
      "\u0101": "a",
      "\u0103": "a",
      "\u0105": "a",
      "\u0106": "C",
      "\u0108": "C",
      "\u010A": "C",
      "\u010C": "C",
      "\u0107": "c",
      "\u0109": "c",
      "\u010B": "c",
      "\u010D": "c",
      "\u010E": "D",
      "\u0110": "D",
      "\u010F": "d",
      "\u0111": "d",
      "\u0112": "E",
      "\u0114": "E",
      "\u0116": "E",
      "\u0118": "E",
      "\u011A": "E",
      "\u0113": "e",
      "\u0115": "e",
      "\u0117": "e",
      "\u0119": "e",
      "\u011B": "e",
      "\u011C": "G",
      "\u011E": "G",
      "\u0120": "G",
      "\u0122": "G",
      "\u011D": "g",
      "\u011F": "g",
      "\u0121": "g",
      "\u0123": "g",
      "\u0124": "H",
      "\u0126": "H",
      "\u0125": "h",
      "\u0127": "h",
      "\u0128": "I",
      "\u012A": "I",
      "\u012C": "I",
      "\u012E": "I",
      "\u0130": "I",
      "\u0129": "i",
      "\u012B": "i",
      "\u012D": "i",
      "\u012F": "i",
      "\u0131": "i",
      "\u0134": "J",
      "\u0135": "j",
      "\u0136": "K",
      "\u0137": "k",
      "\u0138": "k",
      "\u0139": "L",
      "\u013B": "L",
      "\u013D": "L",
      "\u013F": "L",
      "\u0141": "L",
      "\u013A": "l",
      "\u013C": "l",
      "\u013E": "l",
      "\u0140": "l",
      "\u0142": "l",
      "\u0143": "N",
      "\u0145": "N",
      "\u0147": "N",
      "\u014A": "N",
      "\u0144": "n",
      "\u0146": "n",
      "\u0148": "n",
      "\u014B": "n",
      "\u014C": "O",
      "\u014E": "O",
      "\u0150": "O",
      "\u014D": "o",
      "\u014F": "o",
      "\u0151": "o",
      "\u0154": "R",
      "\u0156": "R",
      "\u0158": "R",
      "\u0155": "r",
      "\u0157": "r",
      "\u0159": "r",
      "\u015A": "S",
      "\u015C": "S",
      "\u015E": "S",
      "\u0160": "S",
      "\u015B": "s",
      "\u015D": "s",
      "\u015F": "s",
      "\u0161": "s",
      "\u0162": "T",
      "\u0164": "T",
      "\u0166": "T",
      "\u0163": "t",
      "\u0165": "t",
      "\u0167": "t",
      "\u0168": "U",
      "\u016A": "U",
      "\u016C": "U",
      "\u016E": "U",
      "\u0170": "U",
      "\u0172": "U",
      "\u0169": "u",
      "\u016B": "u",
      "\u016D": "u",
      "\u016F": "u",
      "\u0171": "u",
      "\u0173": "u",
      "\u0174": "W",
      "\u0175": "w",
      "\u0176": "Y",
      "\u0177": "y",
      "\u0178": "Y",
      "\u0179": "Z",
      "\u017B": "Z",
      "\u017D": "Z",
      "\u017A": "z",
      "\u017C": "z",
      "\u017E": "z",
      "\u0132": "IJ",
      "\u0133": "ij",
      "\u0152": "Oe",
      "\u0153": "oe",
      "\u0149": "'n",
      "\u017F": "ss",
    };
    var freeGlobal =
      typeof global == "object" && global && global.Object === Object && global;
    var freeSelf =
      typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1,
        length = array ? array.length : 0;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    function basePropertyOf(object) {
      return function (key) {
        return object == null ? void 0 : object[key];
      };
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var Symbol2 = root.Symbol;
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolToString = symbolProto ? symbolProto.toString : void 0;
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function createCompounder(callback) {
      return function (string) {
        return arrayReduce(
          words(deburr(string).replace(reApos, "")),
          callback,
          "",
        );
      };
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return (
        typeof value == "symbol" ||
        (isObjectLike(value) && objectToString.call(value) == symbolTag)
      );
    }
    function toString(value) {
      return value == null ? "" : baseToString(value);
    }
    function deburr(string) {
      string = toString(string);
      return (
        string && string.replace(reLatin, deburrLetter).replace(reComboMark, "")
      );
    }
    var snakeCase = createCompounder(function (result, word, index) {
      return result + (index ? "_" : "") + word.toLowerCase();
    });
    function words(string, pattern, guard) {
      string = toString(string);
      pattern = guard ? void 0 : pattern;
      if (pattern === void 0) {
        return hasUnicodeWord(string)
          ? unicodeWords(string)
          : asciiWords(string);
      }
      return string.match(pattern) || [];
    }
    module2.exports = snakeCase;
  },
});

// node_modules/@aws-amplify/platform-core/lib/naming_convention_conversions.js
var require_naming_convention_conversions = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/naming_convention_conversions.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NamingConverter = void 0;
    var lodash_snakecase_1 = __importDefault(require_lodash2());
    var NamingConverter = class {
      /**
       * Converts input string to SCREAMING_SNAKE_CASE
       * @param input Input string to convert
       */
      toScreamingSnakeCase(input) {
        return (0, lodash_snakecase_1.default)(input).toUpperCase();
      }
    };
    exports2.NamingConverter = NamingConverter;
  },
});

// node_modules/@aws-amplify/platform-core/lib/telemetry-data/telemetry_data.js
var require_telemetry_data = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/telemetry-data/telemetry_data.js"(
    exports2,
  ) {
    "use strict";
    var __importDefault =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.telemetryPayloadSchema = void 0;
    var zod_1 = __importDefault(require_lib());
    var identifiersSchema = zod_1.default.object({
      payloadVersion: zod_1.default.string(),
      sessionUuid: zod_1.default.string(),
      eventId: zod_1.default.string(),
      timestamp: zod_1.default.string(),
      localProjectId: zod_1.default.string(),
      accountId: zod_1.default.string().optional(),
      awsRegion: zod_1.default.string().optional(),
    });
    var eventSchema = zod_1.default.object({
      state: zod_1.default.enum(["ABORTED", "FAILED", "SUCCEEDED"]),
      command: zod_1.default.object({
        path: zod_1.default.array(zod_1.default.string()),
        parameters: zod_1.default.array(zod_1.default.string()),
      }),
    });
    var environmentSchema = zod_1.default.object({
      os: zod_1.default.object({
        platform: zod_1.default.string(),
        release: zod_1.default.string(),
      }),
      shell: zod_1.default.string(),
      npmUserAgent: zod_1.default.string(),
      ci: zod_1.default.boolean(),
      memory: zod_1.default.object({
        total: zod_1.default.number(),
        free: zod_1.default.number(),
      }),
    });
    var projectSchema = zod_1.default.object({
      dependencies: zod_1.default
        .array(
          zod_1.default.object({
            name: zod_1.default.string(),
            version: zod_1.default.string(),
          }),
        )
        .optional(),
    });
    var latencySchema = zod_1.default.object({
      total: zod_1.default.number(),
      init: zod_1.default.number().optional(),
      synthesis: zod_1.default.number().optional(),
      deployment: zod_1.default.number().optional(),
      hotSwap: zod_1.default.number().optional(),
    });
    var errorSchema = zod_1.default.lazy(() =>
      zod_1.default.object({
        name: zod_1.default.string(),
        message: zod_1.default.string(),
        stack: zod_1.default.string(),
        cause: zod_1.default.optional(errorSchema),
        // Recursive reference
      }),
    );
    exports2.telemetryPayloadSchema = zod_1.default.object({
      identifiers: identifiersSchema,
      event: eventSchema,
      environment: environmentSchema,
      project: projectSchema,
      latency: latencySchema,
      error: zod_1.default.optional(errorSchema),
    });
  },
});

// node_modules/@aws-amplify/platform-core/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/@aws-amplify/platform-core/lib/index.js"(exports2) {
    "use strict";
    var __createBinding =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (
              !desc ||
              ("get" in desc
                ? !m.__esModule
                : desc.writable || desc.configurable)
            ) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __exportStar =
      (exports2 && exports2.__exportStar) ||
      function (m, exports3) {
        for (var p in m)
          if (
            p !== "default" &&
            !Object.prototype.hasOwnProperty.call(exports3, p)
          )
            __createBinding(exports3, m, p);
      };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.telemetryPayloadSchema =
      exports2.TagName =
      exports2.CDKContextKey =
      exports2.USAGE_DATA_TRACKING_ENABLED =
        void 0;
    __exportStar(require_backend_identifier_conversions(), exports2);
    __exportStar(require_backend_entry_point_locator(), exports2);
    __exportStar(require_caller_directory_extractor(), exports2);
    __exportStar(require_extract_file_path_from_stack_trace_line(), exports2);
    __exportStar(require_package_json_reader(), exports2);
    __exportStar(require_usage_data_emitter_factory(), exports2);
    __exportStar(require_local_configuration_controller_factory(), exports2);
    __exportStar(require_typed_configuration_file_factory(), exports2);
    __exportStar(require_errors(), exports2);
    var constants_js_1 = require_constants();
    Object.defineProperty(exports2, "USAGE_DATA_TRACKING_ENABLED", {
      enumerable: true,
      get: function () {
        return constants_js_1.USAGE_DATA_TRACKING_ENABLED;
      },
    });
    var cdk_context_key_js_1 = require_cdk_context_key();
    Object.defineProperty(exports2, "CDKContextKey", {
      enumerable: true,
      get: function () {
        return cdk_context_key_js_1.CDKContextKey;
      },
    });
    __exportStar(require_parameter_path_conversions(), exports2);
    __exportStar(require_object_accumulator(), exports2);
    var tag_name_js_1 = require_tag_name();
    Object.defineProperty(exports2, "TagName", {
      enumerable: true,
      get: function () {
        return tag_name_js_1.TagName;
      },
    });
    __exportStar(require_naming_convention_conversions(), exports2);
    var telemetry_data_js_1 = require_telemetry_data();
    Object.defineProperty(exports2, "telemetryPayloadSchema", {
      enumerable: true,
      get: function () {
        return telemetry_data_js_1.telemetryPayloadSchema;
      },
    });
  },
});

// node_modules/@aws-amplify/backend/lib/engine/backend-secret/lambda/backend_secret_fetcher.js
var backend_secret_fetcher_exports = {};
__export(backend_secret_fetcher_exports, {
  handleCreateUpdateEvent: () => handleCreateUpdateEvent,
  handler: () => handler,
});
module.exports = __toCommonJS(backend_secret_fetcher_exports);

// node_modules/@aws-amplify/backend-secret/lib/secret_error.js
var import_client_ssm = require("@aws-sdk/client-ssm");
var SecretError = class _SecretError extends Error {
  cause;
  httpStatusCode;
  /**
   * Creates a secret error instance.
   */
  constructor(message, options) {
    super(message);
    this.name = "SecretError";
    this.cause = options?.cause;
    this.httpStatusCode = options?.httpStatusCode;
  }
  /**
   * Creates a secret error from an underlying cause.
   */
  static createInstance = (cause) => {
    if (cause instanceof import_client_ssm.SSMServiceException) {
      return _SecretError.fromSSMException(cause);
    }
    return new _SecretError(cause.message, { cause });
  };
  /**
   * Creates a secret error from an SSM exception.
   */
  static fromSSMException = (ssmException) => {
    return new _SecretError(JSON.stringify(ssmException), {
      cause: ssmException,
      httpStatusCode: ssmException.$metadata.httpStatusCode,
    });
  };
};

// node_modules/@aws-amplify/backend-secret/lib/ssm_secret.js
var import_platform_core = __toESM(require_lib2(), 1);
var SSMSecretClient = class {
  ssmClient;
  /**
   * Creates a new instance of SSMSecret.
   */
  constructor(ssmClient) {
    this.ssmClient = ssmClient;
  }
  /**
   * Get a secret from SSM parameter store.
   */
  getSecret = async (backendIdentifier, secretIdentifier) => {
    let secret;
    const name =
      import_platform_core.ParameterPathConversions.toParameterFullPath(
        backendIdentifier,
        secretIdentifier.name,
      );
    try {
      const resp = await this.ssmClient.getParameter({
        Name: secretIdentifier.version
          ? `${name}:${secretIdentifier.version}`
          : name,
        WithDecryption: true,
      });
      if (resp.Parameter?.Value) {
        secret = {
          name: secretIdentifier.name,
          version: resp.Parameter.Version,
          value: resp.Parameter.Value,
          lastUpdated: resp.Parameter.LastModifiedDate,
        };
      }
    } catch (err) {
      throw SecretError.createInstance(err);
    }
    if (!secret) {
      throw new SecretError(
        `The value of secret '${secretIdentifier.name}' is undefined`,
      );
    }
    return secret;
  };
  /**
   * List secrets from SSM parameter store.
   */
  listSecrets = async (backendIdentifier) => {
    const path =
      import_platform_core.ParameterPathConversions.toParameterPrefix(
        backendIdentifier,
      );
    const result = [];
    try {
      let nextToken;
      do {
        const resp = await this.ssmClient.getParametersByPath({
          Path: path,
          WithDecryption: true,
          NextToken: nextToken,
        });
        resp.Parameters?.forEach((param) => {
          if (!param.Name || !param.Value) {
            return;
          }
          const secretName = param.Name.split("/").pop();
          if (secretName) {
            result.push({
              name: secretName,
              version: param.Version,
              lastUpdated: param.LastModifiedDate,
            });
          }
        });
        nextToken = resp.NextToken;
      } while (nextToken);
      return result;
    } catch (err) {
      throw SecretError.createInstance(err);
    }
  };
  /**
   * Set a secret in SSM parameter store.
   */
  setSecret = async (backendIdentifier, secretName, secretValue) => {
    const name =
      import_platform_core.ParameterPathConversions.toParameterFullPath(
        backendIdentifier,
        secretName,
      );
    try {
      const resp = await this.ssmClient.putParameter({
        Name: name,
        Type: "SecureString",
        Value: secretValue,
        Description: `Amplify Secret`,
        Overwrite: true,
      });
      return {
        name: secretName,
        version: resp.Version,
      };
    } catch (err) {
      throw SecretError.createInstance(err);
    }
  };
  /**
   * Remove a secret from SSM parameter store.
   */
  removeSecret = async (backendIdentifier, secretName) => {
    const name =
      import_platform_core.ParameterPathConversions.toParameterFullPath(
        backendIdentifier,
        secretName,
      );
    try {
      await this.ssmClient.deleteParameter({
        Name: name,
      });
    } catch (err) {
      throw SecretError.createInstance(err);
    }
  };
  /**
   * Remove secrets from SSM parameter store.
   */
  removeSecrets = async (backendIdentifier, secretNames) => {
    const names = secretNames.map((secretName) =>
      import_platform_core.ParameterPathConversions.toParameterFullPath(
        backendIdentifier,
        secretName,
      ),
    );
    try {
      const resp = await this.ssmClient.deleteParameters({
        Names: names,
      });
      if (resp.InvalidParameters && resp.InvalidParameters.length > 0) {
        throw new SecretError(
          `Failed to remove secrets: ${resp.InvalidParameters.join(", ")}`,
        );
      }
    } catch (err) {
      if (err instanceof SecretError) {
        throw err;
      }
      throw SecretError.createInstance(err);
    }
  };
};

// node_modules/@aws-amplify/backend-secret/lib/secret.js
var import_client_ssm3 = require("@aws-sdk/client-ssm");

// node_modules/@aws-amplify/backend-secret/lib/ssm_secret_with_amplify_error_handling.js
var import_platform_core2 = __toESM(require_lib2(), 1);
var import_client_ssm2 = require("@aws-sdk/client-ssm");

// node_modules/@aws-amplify/backend-secret/lib/secret.js
var getSecretClient = (secretClientOptions) => {
  return new SSMSecretClient(
    new import_client_ssm3.SSM({
      credentials: secretClientOptions?.credentials,
      region: secretClientOptions?.region,
    }),
  );
};

// node_modules/@aws-amplify/backend/lib/engine/backend-secret/lambda/backend_secret_fetcher.js
var import_node_crypto = require("node:crypto");
var secretClient = getSecretClient();
var handler = async (event) => {
  console.info(`Received '${event.RequestType}' event`);
  const physicalId =
    event.RequestType === "Create"
      ? (0, import_node_crypto.randomUUID)()
      : event.PhysicalResourceId;
  let data = void 0;
  if (event.RequestType === "Update" || event.RequestType === "Create") {
    const secretMap = await handleCreateUpdateEvent(secretClient, event);
    data = {
      ...secretMap,
    };
  }
  return {
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    PhysicalResourceId: physicalId,
    Data: data,
    StackId: event.StackId,
    NoEcho: true,
    Status: "SUCCESS",
  };
};
var handleCreateUpdateEvent = async (secretClient2, event) => {
  const props = event.ResourceProperties;
  const secretMap = {};
  for (const secretName of props.secretNames) {
    let secretValue = void 0;
    try {
      const resp = await secretClient2.getSecret(
        {
          namespace: props.namespace,
          name: props.name,
          type: props.type,
        },
        {
          name: secretName,
        },
      );
      secretValue = resp.value;
    } catch (err) {
      const secretErr = err;
      if (secretErr.httpStatusCode && secretErr.httpStatusCode >= 500) {
        throw new Error(
          `Failed to retrieve backend secret '${secretName}' for '${props.namespace}/${props.name}'. Reason: ${JSON.stringify(err)}`,
          { cause: secretErr },
        );
      }
    }
    if (!secretValue) {
      try {
        const resp = await secretClient2.getSecret(props.namespace, {
          name: secretName,
        });
        secretValue = resp.value;
      } catch (err) {
        throw new Error(
          `Failed to retrieve backend secret '${secretName}' for '${props.namespace}'. Reason: ${JSON.stringify(err)}`,
          { cause: err },
        );
      }
    }
    if (!secretValue) {
      throw new Error(
        `Unable to find backend secret for backend '${props.namespace}', branch '${props.name}', name '${secretName}'`,
      );
    }
    secretMap[secretName] = secretValue;
  }
  return secretMap;
};
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    handleCreateUpdateEvent,
    handler,
  });
