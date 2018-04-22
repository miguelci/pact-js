/**
 * Pact Utilities module.
 * @module PactUtils
 */
import { Interaction, ResponseOptions, RequestOptions, InteractionState, Query } from "../dsl/interaction";
import { HTTPMethod, methods } from "../common/request";
import { MatcherResult, regex } from "./matchers";
import { extend } from "underscore";
import { keys, isNil, omitBy } from "lodash";
import gql from "graphql-tag";
import { ERROR } from "bunyan";

export type GraphQLOperation = "query" | "mutation" | null;

enum GraphQLOperations {
  query = "query",
  mutation = "mutation",
}

export interface GraphQLVariables { [name: string]: any; }

/**
 * GraphQL interface
 */
export class GraphQLInteraction extends Interaction {
  private operation: GraphQLOperation = null;
  private variables: GraphQLVariables = {};
  private query: string;

  /**
   * The type of GraphQL operation. Generally not required.
   *
   * @param {string} operation The operation, one of "query"|"mutation"
   * @returns {Interaction} interaction
   */
  public withOperation(operation: GraphQLOperation) {
    if (!operation || operation && keys(GraphQLOperations).indexOf(operation.toString()) < 0) {
      throw new Error(`You must provide a valid HTTP method: ${keys(GraphQLOperations).join(", ")}.`);
    }

    this.operation = operation;

    return this;
  }

  /**
   * Any variables used in the Query
   * @param {Object} variables a k/v set of variables for the query
   * @returns {Interaction} interaction
   */
  public withVariables(variables: GraphQLVariables) {
    this.variables = variables;

    return this;
  }

  /**
   * The actual GraphQL query as a string.
   *
   * NOTE: spaces are not important, Pact will auto-generate a space-insensitive matcher
   *
   *  e.g. the value for the "query" field in the GraphQL HTTP payload:
   *  '{ "query": "{
   *        Category(id:7) {
   *          id,
   *          name,
   *          subcategories {
   *            id,
   *            name
   *          }
   *        }
   *     }"
   *  }'
   * @param {Object} query the actual GraphQL query, as per example above.
   * @returns {Interaction} interaction
   */
  public withQuery(query: string) {
    if (isNil(query)) {
      throw new Error("You must provide a GraphQL query.");
    }

    try {
      gql(query);
    } catch (e) {
      throw new Error(`GraphQL Query is invalid: ${e.message}`);
    }

    this.query = query;

    return this;
  }

  /**
   * Returns the interaction object created.
   * @returns {Object}
   */
  public json(): InteractionState {
    if (isNil(this.query)) {
      throw new Error("You must provide a GraphQL query.");
    }
    if (isNil(this.state.description)) {
      throw new Error("You must provide a description for the query.");
    }

    this.state.request = extend({
      body: {
        operationName: this.operation,
        query: regex({ generate: this.query, matcher: this.query.replace(/\s+/g, "\\s+") }),
        variables: this.variables,
      },
      headers: { "content-type": "application/json" },
      method: "POST",
    }, this.state.request);

    return this.state;
  }
}
